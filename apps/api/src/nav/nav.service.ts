import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { NavItem } from '../content/entities/nav-item.entity';
import { CreateNavItemDto } from './dto/create-nav-item.dto';
import { UpdateNavItemDto } from './dto/update-nav-item.dto';
import { ReorderDto } from '../categories/dto/reorder.dto';
import { REDIS_CLIENT } from '../common/redis/redis.module';

const NAV_CACHE_KEY = 'nav:tree';
const NAV_TTL = 3600;

@Injectable()
export class NavService {
  constructor(
    @InjectRepository(NavItem) private readonly repo: Repository<NavItem>,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async getTree() {
    const cached = await this.redis.get(NAV_CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const all = await this.repo.find({
      where: { isActive: true, showInNav: true },
      order: { sortOrder: 'ASC' },
    });

    const tree = this.buildTree(all, null);
    await this.redis.setex(NAV_CACHE_KEY, NAV_TTL, JSON.stringify(tree));
    return tree;
  }

  private buildTree(items: NavItem[], parentId: string | null): NavItem[] {
    return items
      .filter((i) => i.parentId === parentId)
      .map((item) => ({ ...item, children: this.buildTree(items, item.id) }));
  }

  async create(dto: CreateNavItemDto) {
    const item = this.repo.create(dto);
    const saved = await this.repo.save(item);
    await this.redis.del(NAV_CACHE_KEY);
    return saved;
  }

  async update(id: string, dto: UpdateNavItemDto) {
    const item = await this.repo.findOneBy({ id });
    if (!item) throw new NotFoundException('Nav item not found');
    Object.assign(item, dto);
    const saved = await this.repo.save(item);
    await this.redis.del(NAV_CACHE_KEY);
    return saved;
  }

  async remove(id: string) {
    const item = await this.repo.findOneBy({ id });
    if (!item) throw new NotFoundException('Nav item not found');
    await this.repo.remove(item);
    await this.redis.del(NAV_CACHE_KEY);
  }

  async reorder(dto: ReorderDto) {
    await Promise.all(dto.items.map((item) => this.repo.update(item.id, { sortOrder: item.sortOrder })));
    await this.redis.del(NAV_CACHE_KEY);
  }
}
