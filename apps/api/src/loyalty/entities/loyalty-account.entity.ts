import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LoyaltyTier } from './loyalty-tier.entity';

@Entity('loyalty_accounts')
export class LoyaltyAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'tier_id', type: 'uuid', nullable: true })
  tierId: string | null;

  @ManyToOne(() => LoyaltyTier, { nullable: true })
  @JoinColumn({ name: 'tier_id' })
  tier: LoyaltyTier | null;

  @Column({ name: 'points_balance', type: 'integer', default: 0 })
  pointsBalance: number;

  @Column({ name: 'lifetime_points', type: 'integer', default: 0 })
  lifetimePoints: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
