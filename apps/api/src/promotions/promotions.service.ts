import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Or, IsNull } from 'typeorm';
import { Inject } from '@nestjs/common';
import { REDIS_CLIENT } from '../common/redis/redis.module';
import Redis from 'ioredis';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

const CACHE_KEY = 'promotions:active';
const CACHE_TTL = 300;

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion) private readonly repo: Repository<Promotion>,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async getActive(): Promise<Promotion[]> {
    const cached = await this.redis.get(CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const now = new Date();
    const promotions = await this.repo
      .createQueryBuilder('p')
      .where('p.is_active = true')
      .andWhere('(p.starts_at IS NULL OR p.starts_at <= :now)', { now })
      .andWhere('(p.ends_at IS NULL OR p.ends_at >= :now)', { now })
      .orderBy('p.is_flash_sale', 'DESC')
      .addOrderBy('p.created_at', 'DESC')
      .getMany();

    await this.redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(promotions));
    return promotions;
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const promo = await this.repo.findOne({ where: { id } });
    if (!promo) throw new NotFoundException('Promotion not found');
    return promo;
  }

  async create(dto: CreatePromotionDto) {
    const promo = this.repo.create(dto);
    const saved = await this.repo.save(promo);
    await this.redis.del(CACHE_KEY);
    return saved;
  }

  async update(id: string, dto: UpdatePromotionDto) {
    const promo = await this.findOne(id);
    Object.assign(promo, dto);
    const saved = await this.repo.save(promo);
    await this.redis.del(CACHE_KEY);
    return saved;
  }

  async remove(id: string) {
    const promo = await this.findOne(id);
    await this.repo.remove(promo);
    await this.redis.del(CACHE_KEY);
  }
}
