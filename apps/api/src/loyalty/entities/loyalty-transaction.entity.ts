import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LoyaltyAccount } from './loyalty-account.entity';
import { LoyaltyTransactionType } from '@nooremoon/shared';

@Entity('loyalty_transactions')
export class LoyaltyTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @ManyToOne(() => LoyaltyAccount)
  @JoinColumn({ name: 'account_id' })
  account: LoyaltyAccount;

  @Column({ type: 'varchar', length: 50 })
  type: LoyaltyTransactionType;

  @Column({ type: 'integer' })
  points: number;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
