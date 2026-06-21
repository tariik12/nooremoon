import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Address } from '../../cart/entities/address.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory } from './order-status-history.entity';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@nooremoon/shared';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_number', type: 'varchar', length: 50, unique: true })
  orderNumber: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'shipping_address_id', type: 'uuid', nullable: true })
  shippingAddressId: string | null;

  @ManyToOne(() => Address, { nullable: true })
  @JoinColumn({ name: 'shipping_address_id' })
  shippingAddress: Address | null;

  @Column({ type: 'varchar', length: 50, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ name: 'payment_method', type: 'varchar', length: 20, nullable: true })
  paymentMethod: PaymentMethod | null;

  @Column({ name: 'payment_status', type: 'varchar', length: 20, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ name: 'subtotal_cents', type: 'integer' })
  subtotalCents: number;

  @Column({ name: 'shipping_cents', type: 'integer', default: 0 })
  shippingCents: number;

  @Column({ name: 'discount_cents', type: 'integer', default: 0 })
  discountCents: number;

  @Column({ name: 'gift_card_applied_cents', type: 'integer', default: 0 })
  giftCardAppliedCents: number;

  @Column({ name: 'total_cents', type: 'integer' })
  totalCents: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ name: 'stripe_payment_intent_id', type: 'varchar', length: 255, nullable: true })
  stripePaymentIntentId: string | null;

  @Column({ name: 'bkash_payment_id', type: 'varchar', length: 255, nullable: true })
  bkashPaymentId: string | null;

  @Column({ name: 'eps_transaction_id', type: 'varchar', length: 255, nullable: true })
  epsTransactionId: string | null;

  @Column({ name: 'tracking_number', type: 'varchar', length: 255, nullable: true })
  trackingNumber: string | null;

  @Column({ name: 'courier_name', type: 'varchar', length: 100, nullable: true })
  courierName: string | null;

  @Column({ name: 'service_centre_confirmed_at', type: 'timestamptz', nullable: true })
  serviceCentreConfirmedAt: Date | null;

  @Column({ name: 'cancellation_window_open', type: 'boolean', default: true })
  cancellationWindowOpen: boolean;

  @Column({ name: 'ivr_call_id', type: 'varchar', length: 255, nullable: true })
  ivrCallId: string | null;

  @Column({ name: 'ivr_status', type: 'varchar', length: 50, default: 'not_triggered' })
  ivrStatus: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (h) => h.order)
  statusHistory: OrderStatusHistory[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
