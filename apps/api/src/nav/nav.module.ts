import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavItem } from '../content/entities/nav-item.entity';
import { NavController } from './nav.controller';
import { NavService } from './nav.service';

@Module({
  imports: [TypeOrmModule.forFeature([NavItem])],
  controllers: [NavController],
  providers: [NavService],
})
export class NavModule {}
