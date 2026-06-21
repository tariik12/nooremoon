import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, HttpCode, HttpStatus, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@Controller()
export class PromotionsController {
  constructor(private readonly service: PromotionsService) {}

  // Public — active promotions/offers shown on profile page
  @Get('promotions/active')
  getActive() {
    return this.service.getActive();
  }

  // Admin CRUD
  @Get('admin/promotions')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('promotions.view')
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.service.findAll(page, limit);
  }

  @Get('admin/promotions/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('promotions.view')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post('admin/promotions')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('promotions.manage')
  create(@Body() dto: CreatePromotionDto) {
    return this.service.create(dto);
  }

  @Patch('admin/promotions/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('promotions.manage')
  update(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return this.service.update(id, dto);
  }

  @Delete('admin/promotions/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('promotions.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
