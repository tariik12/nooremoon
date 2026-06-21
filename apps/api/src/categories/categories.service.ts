import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { Category } from '../products/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderDto } from './dto/reorder.dto';
import { REDIS_CLIENT } from '../common/redis/redis.module';

const NAV_CACHE_KEY = 'nav:tree';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  findAll() {
    return this.repo.find({
      where: { isActive: true },
      relations: { subCategories: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findBySlug(slug: string) {
    const cat = await this.repo.findOne({
      where: { slug, isActive: true },
      relations: { subCategories: true },
    });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.repo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Slug already in use');
    const cat = this.repo.create(dto);
    const saved = await this.repo.save(cat);
    await this.redis.del(NAV_CACHE_KEY);
    return saved;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.repo.findOneBy({ id });
    if (!cat) throw new NotFoundException('Category not found');
    Object.assign(cat, dto);
    const saved = await this.repo.save(cat);
    await this.redis.del(NAV_CACHE_KEY);
    return saved;
  }

  async deactivate(id: string) {
    const cat = await this.repo.findOneBy({ id });
    if (!cat) throw new NotFoundException('Category not found');
    cat.isActive = false;
    await this.repo.save(cat);
    await this.redis.del(NAV_CACHE_KEY);
  }

  async reorder(dto: ReorderDto) {
    await Promise.all(
      dto.items.map((item) =>
        this.repo.update(item.id, { sortOrder: item.sortOrder }),
      ),
    );
    await this.redis.del(NAV_CACHE_KEY);
  }
}
