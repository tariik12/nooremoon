import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Season } from './season.entity';

@Entity('season_sub_collections')
export class SeasonSubCollection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'season_id', type: 'uuid' })
  seasonId: string;

  @ManyToOne(() => Season, (s) => s.subCollections)
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @Column({ type: 'varchar', length: 200 })
  label: string;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @Column({ name: 'sub_category_id', type: 'uuid', nullable: true })
  subCategoryId: string | null;

  @Column({ name: 'hero_image_url', type: 'varchar', length: 500, nullable: true })
  heroImageUrl: string | null;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
