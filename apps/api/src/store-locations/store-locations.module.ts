import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreLocation } from '../content/entities/store-location.entity';
import { StoreLocationsController } from './store-locations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StoreLocation])],
  controllers: [StoreLocationsController],
})
export class StoreLocationsModule {}
