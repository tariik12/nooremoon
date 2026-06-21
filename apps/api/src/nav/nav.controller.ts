import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { NavService } from './nav.service';
import { CreateNavItemDto } from './dto/create-nav-item.dto';
import { UpdateNavItemDto } from './dto/update-nav-item.dto';
import { ReorderDto } from '../categories/dto/reorder.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@Controller()
export class NavController {
  constructor(private readonly service: NavService) {}

  @Get('nav')
  getTree() {
    return this.service.getTree();
  }

  @Post('admin/nav')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('nav.manage')
  create(@Body() dto: CreateNavItemDto) {
    return this.service.create(dto);
  }

  @Patch('admin/nav/reorder')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('nav.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorder(@Body() dto: ReorderDto) {
    return this.service.reorder(dto);
  }

  @Patch('admin/nav/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('nav.manage')
  update(@Param('id') id: string, @Body() dto: UpdateNavItemDto) {
    return this.service.update(id, dto);
  }

  @Delete('admin/nav/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('nav.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
