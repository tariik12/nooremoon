import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tier } from '../products/entities/tier.entity';
import { TiersController } from './tiers.controller';
import { TiersService } from './tiers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tier])],
  controllers: [TiersController],
  providers: [TiersService],
  exports: [TiersService],
})
export class TiersModule {}
