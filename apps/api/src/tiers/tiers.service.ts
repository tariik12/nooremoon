import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tier } from '../products/entities/tier.entity';
import { CreateTierDto } from './dto/create-tier.dto';
import { UpdateTierDto } from './dto/update-tier.dto';
import { ReorderDto } from '../categories/dto/reorder.dto';

@Injectable()
export class TiersService {
  constructor(
    @InjectRepository(Tier) private readonly repo: Repository<Tier>,
  ) {}

  findAll() {
    return this.repo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async create(dto: CreateTierDto) {
    const existing = await this.repo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Slug already in use');
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateTierDto) {
    const tier = await this.repo.findOneBy({ id });
    if (!tier) throw new NotFoundException('Tier not found');
    Object.assign(tier, dto);
    return this.repo.save(tier);
  }

  async deactivate(id: string) {
    const tier = await this.repo.findOneBy({ id });
    if (!tier) throw new NotFoundException('Tier not found');
    tier.isActive = false;
    await this.repo.save(tier);
  }

  async reorder(dto: ReorderDto) {
    await Promise.all(
      dto.items.map((item) => this.repo.update(item.id, { sortOrder: item.sortOrder })),
    );
  }
}
