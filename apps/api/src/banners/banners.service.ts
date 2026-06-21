import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull, Or } from 'typeorm';
import Redis from 'ioredis';
import { Banner } from '../content/entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ReorderDto } from '../categories/dto/reorder.dto';
import { REDIS_CLIENT } from '../common/redis/redis.module';

const CACHE_PREFIX = 'banners:page:';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner) private readonly repo: Repository<Banner>,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async findForPage(pageType: string, pageId?: string) {
    const cacheKey = `${CACHE_PREFIX}${pageType}:${pageId ?? 'all'}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const now = new Date();
    const qb = this.repo.createQueryBuilder('b')
      .where('b.is_active = true')
      .andWhere('b.page_type = :pageType', { pageType })
      .andWhere('(b.starts_at IS NULL OR b.starts_at <= :now)', { now })
      .andWhere('(b.ends_at IS NULL OR b.ends_at >= :now)', { now })
      .orderBy('b.sort_order', 'ASC');

    if (pageId) qb.andWhere('(b.page_id = :pageId OR b.page_id IS NULL)', { pageId });

    const banners = await qb.getMany();
    await this.redis.setex(cacheKey, 300, JSON.stringify(banners));
    return banners;
  }

  async create(dto: CreateBannerDto) {
    const banner = this.repo.create(dto);
    const saved = await this.repo.save(banner);
    await this.invalidateCache(saved.pageType);
    return saved;
  }

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await this.repo.findOneBy({ id });
    if (!banner) throw new NotFoundException('Banner not found');
    Object.assign(banner, dto);
    const saved = await this.repo.save(banner);
    await this.invalidateCache(saved.pageType);
    return saved;
  }

  async remove(id: string) {
    const banner = await this.repo.findOneBy({ id });
    if (!banner) throw new NotFoundException('Banner not found');
    await this.repo.remove(banner);
    await this.invalidateCache(banner.pageType);
  }

  async reorder(dto: ReorderDto) {
    await Promise.all(dto.items.map((item) => this.repo.update(item.id, { sortOrder: item.sortOrder })));
    await this.invalidateAllCache();
  }

  private async invalidateCache(pageType: string) {
    const keys = await this.redis.keys(`${CACHE_PREFIX}${pageType}:*`);
    if (keys.length) await this.redis.del(...keys);
  }

  private async invalidateAllCache() {
    const keys = await this.redis.keys(`${CACHE_PREFIX}*`);
    if (keys.length) await this.redis.del(...keys);
  }
}
