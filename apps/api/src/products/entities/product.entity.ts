import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { SubCategory } from './sub-category.entity';
import { Tier } from './tier.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'care_instructions', type: 'text', nullable: true })
  careInstructions: string | null;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'sub_category_id', type: 'uuid', nullable: true })
  subCategoryId: string | null;

  @ManyToOne(() => SubCategory, (sub) => sub.products)
  @JoinColumn({ name: 'sub_category_id' })
  subCategory: SubCategory;

  @Column({ name: 'tier_id', type: 'uuid', nullable: true })
  tierId: string | null;

  @ManyToOne(() => Tier)
  @JoinColumn({ name: 'tier_id' })
  tier: Tier;

  @Column({ name: 'is_cottocool', type: 'boolean', default: false })
  isCottocool: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_flash_sale', type: 'boolean', default: false })
  isFlashSale: boolean;

  @Column({ name: 'base_price_cents', type: 'integer' })
  basePriceCents: number;

  @Column({ name: 'discount_percent', type: 'integer', default: 0 })
  discountPercent: number;

  @Column({ name: 'final_price_cents', type: 'integer' })
  finalPriceCents: number;

  @Column({ name: 'stock_total', type: 'integer', default: 0 })
  stockTotal: number;

  @Column({ name: 'low_stock_threshold', type: 'integer', default: 5 })
  lowStockThreshold: number;

  @Column({ name: 'meta_title', type: 'varchar', length: 255, nullable: true })
  metaTitle: string | null;

  @Column({ name: 'meta_description', type: 'varchar', length: 500, nullable: true })
  metaDescription: string | null;

  @OneToMany(() => ProductImage, (img) => img.product)
  images: ProductImage[];

  @OneToMany(() => ProductVariant, (v) => v.product)
  variants: ProductVariant[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
