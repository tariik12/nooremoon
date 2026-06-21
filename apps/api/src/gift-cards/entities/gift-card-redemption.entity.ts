import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GiftCard } from './gift-card.entity';

@Entity('gift_card_redemptions')
export class GiftCardRedemption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'gift_card_id', type: 'uuid' })
  giftCardId: string;

  @ManyToOne(() => GiftCard)
  @JoinColumn({ name: 'gift_card_id' })
  giftCard: GiftCard;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ name: 'amount_cents', type: 'integer' })
  amountCents: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
