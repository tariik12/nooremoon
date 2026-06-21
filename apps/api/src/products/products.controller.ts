import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  UseGuards, UseInterceptors, UploadedFile, Res, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Response } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { ReorderDto } from '../categories/dto/reorder.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

// __dirname at runtime = apps/api/dist/products/ → up 2 = apps/api/uploads/products
const imageStorage = diskStorage({
  destination: join(__dirname, '..', '..', 'uploads', 'products'),
  filename: (_req, file, cb) => cb(null, `${uuidv4()}${extname(file.originalname)}`),
});

@Controller()
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  // ── Public ──────────────────────────────────────────────────────────────
  @Get('products')
  findAll(@Query() dto: ListProductsDto) {
    return this.service.findAll(dto);
  }

  @Get('products/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  // ── Admin — Product CRUD ─────────────────────────────────────────────────
  @Get('admin/products')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('products.view')
  findAllAdmin(@Query() dto: ListProductsDto) {
    return this.service.findAllAdmin(dto);
  }

  @Get('admin/products/export')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('products.view')
  async exportCsv(@Res() res: Response) {
    const csv = await this.service.exportCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
    res.send(csv);
  }

  @Get('admin/products/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('products.view')
  findByIdAdmin(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post('admin/products')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('products.create')
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Patch('admin/products/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('products.edit')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Delete('admin/products/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('products.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  softDelete(@Param('id') id: string) {
    return this.service.softDelete(id);
  }

  // ── Admin — Images ───────────────────────────────────────────────────────
  @Post('admin/products/:id/images')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('products.edit')
  @UseInterceptors(FileInterceptor('file', { storage: imageStorage }))
  addImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.service.addImage(id, file);
  }

  @Delete('admin/products/:id/images/:imageId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('products.edit')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.service.removeImage(id, imageId);
  }

  @Patch('admin/products/:id/images/reorder')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('products.edit')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorderImages(@Param('id') id: string, @Body() dto: ReorderDto) {
    return this.service.reorderImages(id, dto);
  }

  // ── Admin — Variants ─────────────────────────────────────────────────────
  @Post('admin/products/:id/variants')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('products.edit')
  addVariant(@Param('id') id: string, @Body() dto: CreateVariantDto) {
    return this.service.addVariant(id, dto);
  }

  @Patch('admin/products/:id/variants/:variantId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('products.edit')
  updateVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() dto: Partial<CreateVariantDto>,
  ) {
    return this.service.updateVariant(id, variantId, dto);
  }

  @Delete('admin/products/:id/variants/:variantId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('products.edit')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteVariant(@Param('id') id: string, @Param('variantId') variantId: string) {
    return this.service.deleteVariant(id, variantId);
  }

  @Patch('admin/products/:id/stock')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('products.edit')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateStock(@Param('id') id: string, @Body() dto: UpdateStockDto) {
    return this.service.updateStock(id, dto);
  }

  // ── Admin — CSV ──────────────────────────────────────────────────────────
  @Post('admin/products/import')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('products.create')
  @UseInterceptors(FileInterceptor('file'))
  importCsv(@UploadedFile() file: Express.Multer.File) {
    return this.service.importCsv(file.buffer);
  }
}
