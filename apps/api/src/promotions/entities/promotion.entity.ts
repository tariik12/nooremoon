import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  code: string | null;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ name: 'discount_percent', type: 'integer', nullable: true })
  discountPercent: number | null;

  @Column({ name: 'discount_cents', type: 'integer', nullable: true })
  discountCents: number | null;

  @Column({ name: 'min_order_cents', type: 'integer', nullable: true })
  minOrderCents: number | null;

  @Column({ name: 'max_uses', type: 'integer', nullable: true })
  maxUses: number | null;

  @Column({ name: 'used_count', type: 'integer', default: 0 })
  usedCount: number;

  @Column({ name: 'is_flash_sale', type: 'boolean', default: false })
  isFlashSale: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt: Date | null;

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
