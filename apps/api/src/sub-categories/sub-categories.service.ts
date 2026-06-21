import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubCategory } from '../products/entities/sub-category.entity';
import { Tier } from '../products/entities/tier.entity';
import { CreateSubCategoryDto, AssignTiersDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { ReorderDto } from '../categories/dto/reorder.dto';

@Injectable()
export class SubCategoriesService {
  constructor(
    @InjectRepository(SubCategory)
    private readonly repo: Repository<SubCategory>,
    @InjectRepository(Tier)
    private readonly tierRepo: Repository<Tier>,
  ) {}

  findAll(categoryId?: string) {
    return this.repo.find({
      where: categoryId ? { categoryId, isActive: true } : { isActive: true },
      relations: { category: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findBySlug(slug: string) {
    const sub = await this.repo.findOne({
      where: { slug, isActive: true },
      relations: { category: true },
    });
    if (!sub) throw new NotFoundException('Sub-category not found');
    const tiers = await this.tierRepo
      .createQueryBuilder('t')
      .innerJoin('sub_category_tiers', 'sct', 'sct.tier_id = t.id')
      .where('sct.sub_category_id = :id', { id: sub.id })
      .andWhere('t.is_active = true')
      .orderBy('t.sort_order', 'ASC')
      .getMany();
    return { ...sub, tiers };
  }

  async create(dto: CreateSubCategoryDto) {
    const existing = await this.repo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Slug already in use');
    const sub = this.repo.create(dto);
    return this.repo.save(sub);
  }

  async update(id: string, dto: UpdateSubCategoryDto) {
    const sub = await this.repo.findOneBy({ id });
    if (!sub) throw new NotFoundException('Sub-category not found');
    Object.assign(sub, dto);
    return this.repo.save(sub);
  }

  async deactivate(id: string) {
    const sub = await this.repo.findOneBy({ id });
    if (!sub) throw new NotFoundException('Sub-category not found');
    sub.isActive = false;
    await this.repo.save(sub);
  }

  async assignTiers(id: string, dto: AssignTiersDto) {
    const sub = await this.repo.findOneBy({ id });
    if (!sub) throw new NotFoundException('Sub-category not found');
    await this.repo.manager.query(
      `DELETE FROM sub_category_tiers WHERE sub_category_id = $1`,
      [id],
    );
    if (dto.tierIds.length > 0) {
      const values = dto.tierIds.map((_, i) => `($1, $${i + 2})`).join(', ');
      await this.repo.manager.query(
        `INSERT INTO sub_category_tiers (sub_category_id, tier_id) VALUES ${values} ON CONFLICT DO NOTHING`,
        [id, ...dto.tierIds],
      );
    }
    return this.findBySlug(sub.slug);
  }

  async reorder(dto: ReorderDto) {
    await Promise.all(
      dto.items.map((item) =>
        this.repo.update(item.id, { sortOrder: item.sortOrder }),
      ),
    );
  }
}
