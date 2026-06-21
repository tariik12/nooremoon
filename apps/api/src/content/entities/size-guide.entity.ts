import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('size_guides')
export class SizeGuide {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'garment_type', type: 'varchar', length: 100 })
  garmentType: string;

  @Column({ name: 'style_fit', type: 'varchar', length: 100, nullable: true })
  styleFit: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string | null;

  @Column({ type: 'varchar', length: 5, default: 'cm' })
  unit: string;

  @Column({ name: 'chart_data', type: 'jsonb' })
  chartData: object;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
