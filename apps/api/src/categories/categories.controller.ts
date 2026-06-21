import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderDto } from './dto/reorder.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@Controller()
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  // ── Public ──────────────────────────────────────────────────────────────
  @Get('categories')
  findAll() {
    return this.service.findAll();
  }

  @Get('categories/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  // ── Admin ────────────────────────────────────────────────────────────────
  @Post('admin/categories')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('categories.create')
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Patch('admin/categories/reorder')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('categories.edit')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorder(@Body() dto: ReorderDto) {
    return this.service.reorder(dto);
  }

  @Patch('admin/categories/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('categories.edit')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete('admin/categories/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('categories.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}
