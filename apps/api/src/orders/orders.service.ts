import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe = require('stripe');
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Address } from '../cart/entities/address.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@nooremoon/shared';
import { REDIS_CLIENT } from '../common/redis/redis.module';
import Redis from 'ioredis';
import { KothaIvrService } from '../kotha-ivr/kotha-ivr.service';

@Injectable()
export class OrdersService {
  private stripe: InstanceType<typeof Stripe>;

  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(OrderStatusHistory) private readonly historyRepo: Repository<OrderStatusHistory>,
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(Address) private readonly addressRepo: Repository<Address>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant) private readonly variantRepo: Repository<ProductVariant>,
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly kothaIvr: KothaIvrService,
  ) {
    const stripeKey = config.get<string>('STRIPE_SECRET_KEY') || '';
    this.stripe = new Stripe(stripeKey || 'sk_test_placeholder', { apiVersion: '2026-05-27.dahlia' });
  }

  async createOrder(dto: CreateOrderDto, userId?: string) {
    const cart = await this.cartRepo.findOne({
      where: userId ? [{ userId }, { sessionId: dto.sessionId }] : [{ sessionId: dto.sessionId }],
      relations: { items: { productVariant: { product: true } } },
    });

    if (!cart || !cart.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    const SHIPPING_FREE_THRESHOLD = 15000;
    const SHIPPING_FLAT = 800;
    const subtotalCents = cart.items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);
    const shippingCents = subtotalCents >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FLAT;
    const totalCents = subtotalCents + shippingCents;

    const orderNumber = `NM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedOrder!: Order;

    try {
      const addrData = dto.address;
      const address = queryRunner.manager.create(Address, {
        userId: userId ?? cart.userId ?? null,
        fullName: addrData.fullName,
        phone: addrData.phone,
        addressLine1: addrData.addressLine1,
        addressLine2: addrData.addressLine2 ?? null,
        city: addrData.city,
        state: addrData.state ?? null,
        postalCode: addrData.postalCode ?? null,
        country: addrData.country,
      });
      const savedAddress = await queryRunner.manager.save(Address, address);

      // Order starts PENDING — IVR call will confirm or cancel
      const order = queryRunner.manager.create(Order, {
        orderNumber,
        userId: userId ?? cart.userId ?? null,
        shippingAddressId: savedAddress.id,
        status: OrderStatus.PENDING,
        paymentMethod: dto.paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        subtotalCents,
        shippingCents,
        discountCents: 0,
        giftCardAppliedCents: 0,
        totalCents,
        currency: 'BDT',
        notes: dto.notes ?? null,
        cancellationWindowOpen: true,
        ivrCallId: null,
        ivrStatus: 'queued',
      });
      savedOrder = await queryRunner.manager.save(Order, order);

      for (const cartItem of cart.items) {
        const variant = cartItem.productVariant;
        const product = variant?.product;
        const item = queryRunner.manager.create(OrderItem, {
          orderId: savedOrder.id,
          productVariantId: cartItem.productVariantId,
          productName: product?.name ?? 'Unknown',
          size: variant?.size ?? '',
          colour: variant?.colour ?? null,
          sku: variant?.sku ?? '',
          quantity: cartItem.quantity,
          unitPriceCents: cartItem.unitPriceCents,
          totalCents: cartItem.unitPriceCents * cartItem.quantity,
        });
        await queryRunner.manager.save(OrderItem, item);

        if (variant) {
          await queryRunner.manager.decrement(ProductVariant, { id: variant.id }, 'stockQty', cartItem.quantity);
        }
      }

      const history = queryRunner.manager.create(OrderStatusHistory, {
        orderId: savedOrder.id,
        fromStatus: null,
        toStatus: OrderStatus.PENDING,
        changedBy: null,
        note: 'Order placed — awaiting IVR confirmation call',
      });
      await queryRunner.manager.save(OrderStatusHistory, history);

      await queryRunner.manager.delete(CartItem, { cartId: cart.id });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    // Trigger IVR call (fire-and-forget)
    const addrLine = [dto.address.addressLine1, dto.address.city, dto.address.country]
      .filter(Boolean).join(', ');
    this.kothaIvr
      .triggerOrderConfirmation({
        id: savedOrder.id,
        orderNumber,
        customerPhone: dto.address.phone,
        customerName: dto.address.fullName,
        addressLine: addrLine,
        totalCents,
        shippingCents,
      })
      .then((callId) => {
        if (callId) {
          this.orderRepo.update(savedOrder.id, { ivrCallId: callId, ivrStatus: 'queued' });
        } else {
          // Kotha not configured — auto-confirm so order doesn't get stuck
          this.autoConfirmOrder(savedOrder.id, dto.paymentMethod as PaymentMethod);
        }
      })
      .catch(() => {
        this.autoConfirmOrder(savedOrder.id, dto.paymentMethod as PaymentMethod);
      });

    // Pre-create Stripe payment intent (used after IVR confirms)
    let clientSecret: string | null = null;
    if (dto.paymentMethod === PaymentMethod.STRIPE) {
      const stripeKey = this.config.get<string>('STRIPE_SECRET_KEY');
      if (stripeKey && stripeKey !== 'sk_test_placeholder') {
        try {
          const intent = await this.stripe.paymentIntents.create({
            amount: totalCents,
            currency: 'usd',
            metadata: { orderNumber, orderId: savedOrder.id },
          });
          await this.orderRepo.update(savedOrder.id, { stripePaymentIntentId: intent.id });
          clientSecret = intent.client_secret;
        } catch {
          // Stripe not live yet
        }
      }
    }

    return {
      order: await this.findByOrderNumber(orderNumber),
      paymentMethod: dto.paymentMethod,
      clientSecret,
    };
  }

  private async autoConfirmOrder(orderId: string, paymentMethod: PaymentMethod) {
    if (paymentMethod === PaymentMethod.COD) {
      await this.orderRepo.update(orderId, { status: OrderStatus.CONFIRMED, ivrStatus: 'auto_confirmed' });
      await this.historyRepo.save(
        this.historyRepo.create({
          orderId,
          fromStatus: OrderStatus.PENDING,
          toStatus: OrderStatus.CONFIRMED,
          changedBy: 'system',
          note: 'Auto-confirmed (IVR not configured)',
        }),
      );
    } else {
      await this.orderRepo.update(orderId, { ivrStatus: 'auto_confirmed' });
    }
  }

  // Called by webhook when IVR call returns 'confirmed'
  async confirmOrderByIvr(orderId: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) return;

    await this.orderRepo.update(orderId, { ivrStatus: 'confirmed' });

    if (order.paymentMethod === PaymentMethod.COD) {
      await this.orderRepo.update(orderId, { status: OrderStatus.CONFIRMED });
      await this.historyRepo.save(
        this.historyRepo.create({
          orderId,
          fromStatus: OrderStatus.PENDING,
          toStatus: OrderStatus.CONFIRMED,
          changedBy: 'ivr',
          note: 'Customer confirmed order via IVR call',
        }),
      );
    }
    // For Stripe/bKash: order stays PENDING until payment completes
  }

  // Called by webhook when IVR call returns 'cancelled' or 'no_answer'
  async cancelOrderByIvr(orderId: string, reason: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order || order.status === OrderStatus.CANCELLED) return;

    await this.orderRepo.update(orderId, { status: OrderStatus.CANCELLED, ivrStatus: reason });
    await this.historyRepo.save(
      this.historyRepo.create({
        orderId,
        fromStatus: order.status,
        toStatus: OrderStatus.CANCELLED,
        changedBy: 'ivr',
        note: `Order cancelled via IVR: ${reason}`,
      }),
    );
  }

  // Fallback for when Kotha webhook can't reach the server (e.g. localhost)
  // Confirms the order if it's been pending for > 60 seconds and still queued
  async ivrFallbackConfirm(orderNumber: string) {
    const order = await this.orderRepo.findOne({ where: { orderNumber } });
    if (!order) throw new NotFoundException('Order not found');

    const secondsOld = (Date.now() - new Date(order.createdAt).getTime()) / 1000;
    if (secondsOld < 30) {
      throw new BadRequestException('Order too new — wait for the call to complete first');
    }

    if (order.ivrStatus !== 'queued' && order.ivrStatus !== 'not_triggered') {
      // Already handled
      return this.getIvrStatus(orderNumber);
    }

    await this.confirmOrderByIvr(order.id);
    return this.getIvrStatus(orderNumber);
  }

  async getIvrStatus(orderNumber: string) {
    const order = await this.orderRepo.findOne({
      where: { orderNumber },
      select: { orderNumber: true, status: true, ivrStatus: true, paymentMethod: true, stripePaymentIntentId: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return {
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      ivrStatus: order.ivrStatus,
      paymentMethod: order.paymentMethod,
      stripePaymentIntentId: order.stripePaymentIntentId,
    };
  }

  async trackOrder(orderNumber: string, phone: string) {
    const order = await this.orderRepo.findOne({
      where: { orderNumber },
      relations: { items: true, shippingAddress: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const clean = (s: string) => s.replace(/[\s\-+]/g, '');
    const addressPhone = order.shippingAddress?.phone ?? '';
    if (clean(addressPhone) !== clean(phone)) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async trackOrdersByPhone(phone: string) {
    const clean = phone.replace(/[\s\-+]/g, '');
    if (clean.length < 6) return [];

    // Join through shipping address to match phone
    const orders = await this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.shippingAddress', 'addr')
      .leftJoinAndSelect('o.items', 'items')
      .where("REPLACE(REPLACE(REPLACE(addr.phone, ' ', ''), '-', ''), '+', '') = :phone", { phone: clean })
      .orderBy('o.created_at', 'DESC')
      .getMany();

    return orders;
  }

  async adminFindAll(page = 1, limit = 20, status?: string, search?: string) {
    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.shippingAddress', 'addr')
      .leftJoinAndSelect('o.items', 'items')
      .leftJoinAndSelect('o.user', 'user')
      .orderBy('o.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) qb.andWhere('o.status = :status', { status });

    if (search) {
      qb.andWhere(
        '(o.order_number ILIKE :q OR addr.full_name ILIKE :q OR addr.phone ILIKE :q OR user.email ILIKE :q)',
        { q: `%${search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async adminFindOne(id: string) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: { items: true, shippingAddress: true, user: true, statusHistory: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async adminUpdateStatus(
    id: string,
    status: string,
    changedBy: string,
    note?: string,
    trackingNumber?: string,
    courierName?: string,
  ) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    const fromStatus = order.status;
    const update: Partial<Order> = { status: status as any };
    if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;
    if (courierName !== undefined) update.courierName = courierName;

    await this.orderRepo.update(id, update);
    await this.historyRepo.save(
      this.historyRepo.create({
        orderId: id,
        fromStatus: fromStatus as any,
        toStatus: status as any,
        changedBy,
        note: note ?? null,
      }),
    );

    return this.adminFindOne(id);
  }

  async findUserOrders(userId: string, page = 1, limit = 10) {
    const [data, total] = await this.orderRepo.findAndCount({
      where: { userId },
      relations: { items: true, shippingAddress: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.orderRepo.findOne({
      where: { orderNumber },
      relations: { items: true, shippingAddress: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findById(id: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
