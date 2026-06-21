import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { SubCategoriesService } from './sub-categories.service';
import { CreateSubCategoryDto, AssignTiersDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { ReorderDto } from '../categories/dto/reorder.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@Controller()
export class SubCategoriesController {
  constructor(private readonly service: SubCategoriesService) {}

  @Get('sub-categories')
  findAll(@Query('categoryId') categoryId?: string) {
    return this.service.findAll(categoryId);
  }

  @Get('sub-categories/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Post('admin/sub-categories')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('categories.create')
  create(@Body() dto: CreateSubCategoryDto) {
    return this.service.create(dto);
  }

  @Post('admin/sub-categories/:id/tiers')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('categories.edit')
  assignTiers(@Param('id') id: string, @Body() dto: AssignTiersDto) {
    return this.service.assignTiers(id, dto);
  }

  @Patch('admin/sub-categories/reorder')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('categories.edit')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorder(@Body() dto: ReorderDto) {
    return this.service.reorder(dto);
  }

  @Patch('admin/sub-categories/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('categories.edit')
  update(@Param('id') id: string, @Body() dto: UpdateSubCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete('admin/sub-categories/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('categories.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}
