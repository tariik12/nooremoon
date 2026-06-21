import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (p) => p.variants)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', length: 20 })
  size: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  colour: string | null;

  @Column({ name: 'colour_hex', type: 'varchar', length: 7, nullable: true })
  colourHex: string | null;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ name: 'stock_qty', type: 'integer', default: 0 })
  stockQty: number;

  @Column({ name: 'price_override_cents', type: 'integer', nullable: true })
  priceOverrideCents: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
