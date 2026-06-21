import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { TiersService } from './tiers.service';
import { CreateTierDto } from './dto/create-tier.dto';
import { UpdateTierDto } from './dto/update-tier.dto';
import { ReorderDto } from '../categories/dto/reorder.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@Controller()
export class TiersController {
  constructor(private readonly service: TiersService) {}

  @Get('tiers')
  findAll() {
    return this.service.findAll();
  }

  @Post('admin/tiers')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('tiers.manage')
  create(@Body() dto: CreateTierDto) {
    return this.service.create(dto);
  }

  @Patch('admin/tiers/reorder')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('tiers.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorder(@Body() dto: ReorderDto) {
    return this.service.reorder(dto);
  }

  @Patch('admin/tiers/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('tiers.manage')
  update(@Param('id') id: string, @Body() dto: UpdateTierDto) {
    return this.service.update(id, dto);
  }

  @Delete('admin/tiers/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('tiers.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}
