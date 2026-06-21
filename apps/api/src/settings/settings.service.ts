import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { AppSetting } from '../content/entities/app-setting.entity';
import { REDIS_CLIENT } from '../common/redis/redis.module';

const CACHE_KEY = 'settings:public';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AppSetting) private readonly repo: Repository<AppSetting>,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async getPublic(): Promise<AppSetting[]> {
    const cached = await this.redis.get(CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const settings = await this.repo.find({ where: { isPublic: true } });
    await this.redis.setex(CACHE_KEY, 600, JSON.stringify(settings));
    return settings;
  }

  async invalidateCache() {
    await this.redis.del(CACHE_KEY);
  }
}
