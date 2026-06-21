import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { REDIS_CLIENT } from '../common/redis/redis.module';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private readonly itemRepo: Repository<CartItem>,
    @InjectRepository(ProductVariant) private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductImage) private readonly imageRepo: Repository<ProductImage>,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async getOrCreateCart(userId: string | null, sessionId: string): Promise<Cart> {
    let cart: Cart | null = null;

    if (userId) {
      cart = await this.cartRepo.findOne({
        where: { userId },
        relations: { items: { productVariant: true } },
      });
    }

    if (!cart) {
      cart = await this.cartRepo.findOne({
        where: { sessionId },
        relations: { items: { productVariant: true } },
      });
    }

    if (!cart) {
      cart = this.cartRepo.create({ userId, sessionId });
      cart = await this.cartRepo.save(cart);
      cart.items = [];
    }

    // If user just logged in, merge session cart into user cart
    if (userId && !cart.userId) {
      cart.userId = userId;
      await this.cartRepo.save(cart);
    }

    return cart;
  }

  async getCart(userId: string | null, sessionId: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    return this.buildCartResponse(cart);
  }

  async addItem(userId: string | null, sessionId: string, dto: AddToCartDto) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const variant = await this.variantRepo.findOne({
      where: { id: dto.productVariantId },
      relations: { product: true },
    });
    if (!variant) throw new NotFoundException('Product variant not found');
    if (variant.stockQty < dto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const existing = await this.itemRepo.findOne({
      where: { cartId: cart.id, productVariantId: dto.productVariantId },
    });

    if (existing) {
      const newQty = existing.quantity + dto.quantity;
      if (variant.stockQty < newQty) throw new BadRequestException('Insufficient stock');
      existing.quantity = newQty;
      await this.itemRepo.save(existing);
    } else {
      const item = this.itemRepo.create({
        cartId: cart.id,
        productVariantId: dto.productVariantId,
        quantity: dto.quantity,
        unitPriceCents: variant.product.finalPriceCents,
      });
      await this.itemRepo.save(item);
    }

    return this.getCart(userId, sessionId);
  }

  async updateItem(userId: string | null, sessionId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    const item = await this.itemRepo.findOne({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new NotFoundException('Cart item not found');

    if (dto.quantity === 0) {
      await this.itemRepo.remove(item);
    } else {
      item.quantity = dto.quantity;
      await this.itemRepo.save(item);
    }

    return this.getCart(userId, sessionId);
  }

  async removeItem(userId: string | null, sessionId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    const item = await this.itemRepo.findOne({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.itemRepo.remove(item);
    return this.getCart(userId, sessionId);
  }

  async clearCart(userId: string | null, sessionId: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    await this.itemRepo.delete({ cartId: cart.id });
  }

  private async buildCartResponse(cart: Cart) {
    const fullItems = await this.itemRepo.find({
      where: { cartId: cart.id },
      relations: { productVariant: { product: { images: true } } },
    });

    const items = fullItems.map((item) => {
      const variant = item.productVariant;
      const product = variant?.product;
      const primaryImage = product?.images?.find((img) => img.isPrimary) ?? product?.images?.[0];

      return {
        id: item.id,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        totalCents: item.unitPriceCents * item.quantity,
        variant: variant
          ? { id: variant.id, size: variant.size, colour: variant.colour, sku: variant.sku, stockQty: variant.stockQty }
          : null,
        product: product
          ? {
              id: product.id,
              name: product.name,
              slug: product.slug,
              imageUrl: primaryImage?.url ?? null,
            }
          : null,
      };
    });

    const subtotalCents = items.reduce((sum, i) => sum + i.totalCents, 0);
    return { cartId: cart.id, items, subtotalCents, itemCount: items.reduce((sum, i) => sum + i.quantity, 0) };
  }
}
