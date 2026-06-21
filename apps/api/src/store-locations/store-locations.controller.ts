import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreLocation } from '../content/entities/store-location.entity';

@Controller('store-locations')
export class StoreLocationsController {
  constructor(
    @InjectRepository(StoreLocation)
    private readonly repo: Repository<StoreLocation>,
  ) {}

  @Get()
  findAll() {
    return this.repo.find({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
    });
  }
}
