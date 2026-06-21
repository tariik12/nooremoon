import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ReorderDto } from '../categories/dto/reorder.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@Controller()
export class BannersController {
  constructor(private readonly service: BannersService) {}

  @Get('banners/:pageType')
  findForPage(@Param('pageType') pageType: string, @Query('pageId') pageId?: string) {
    return this.service.findForPage(pageType, pageId);
  }

  @Post('admin/banners')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('banners.manage')
  create(@Body() dto: CreateBannerDto) {
    return this.service.create(dto);
  }

  @Patch('admin/banners/reorder')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('banners.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorder(@Body() dto: ReorderDto) {
    return this.service.reorder(dto);
  }

  @Patch('admin/banners/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('banners.manage')
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.service.update(id, dto);
  }

  @Delete('admin/banners/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('banners.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
