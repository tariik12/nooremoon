import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import Redis from 'ioredis';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Category } from './entities/category.entity';
import { SubCategory } from './entities/sub-category.entity';
import { Tier } from './entities/tier.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { ReorderDto } from '../categories/dto/reorder.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { REDIS_CLIENT } from '../common/redis/redis.module';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductImage) private readonly imageRepo: Repository<ProductImage>,
    @InjectRepository(ProductVariant) private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(SubCategory) private readonly subCategoryRepo: Repository<SubCategory>,
    @InjectRepository(Tier) private readonly tierRepo: Repository<Tier>,
    private readonly notifications: NotificationsGateway,
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  private computeFinalPrice(basePriceCents: number, discountPercent: number): number {
    return Math.round(basePriceCents * (1 - discountPercent / 100));
  }

  async findAll(dto: ListProductsDto) {
    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.images', 'img', 'img.is_primary = true')
      .leftJoinAndSelect('p.variants', 'v')
      .leftJoinAndSelect('p.category', 'cat')
      .leftJoinAndSelect('p.subCategory', 'sub')
      .leftJoinAndSelect('p.tier', 'tier')
      .where('p.is_active = true')
      .andWhere('p.deleted_at IS NULL');

    if (dto.categoryId) qb.andWhere('p.category_id = :categoryId', { categoryId: dto.categoryId });
    if (dto.subCategoryId) qb.andWhere('p.sub_category_id = :subCategoryId', { subCategoryId: dto.subCategoryId });
    if (dto.tierId) qb.andWhere('p.tier_id = :tierId', { tierId: dto.tierId });
    if (dto.isCottocool !== undefined) qb.andWhere('p.is_cottocool = :isCottocool', { isCottocool: dto.isCottocool });
    if (dto.isFlashSale !== undefined) qb.andWhere('p.is_flash_sale = :isFlashSale', { isFlashSale: dto.isFlashSale });

    if (dto.sort === 'price_asc') qb.orderBy('p.final_price_cents', 'ASC');
    else if (dto.sort === 'price_desc') qb.orderBy('p.final_price_cents', 'DESC');
    else qb.orderBy('p.created_at', 'DESC');

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findAllAdmin(dto: ListProductsDto) {
    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.images', 'img')
      .leftJoinAndSelect('p.category', 'cat')
      .leftJoinAndSelect('p.subCategory', 'sub')
      .leftJoinAndSelect('p.tier', 'tier')
      .where('p.deleted_at IS NULL');

    if (dto.categoryId) qb.andWhere('p.category_id = :categoryId', { categoryId: dto.categoryId });
    if (dto.sort === 'price_asc') qb.orderBy('p.final_price_cents', 'ASC');
    else if (dto.sort === 'price_desc') qb.orderBy('p.final_price_cents', 'DESC');
    else qb.orderBy('p.created_at', 'DESC');

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findById(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: { images: true, variants: true, category: true, subCategory: true, tier: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.productRepo.findOne({
      where: { slug, isActive: true },
      relations: { images: true, variants: true, category: true, subCategory: true, tier: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    const finalPriceCents = this.computeFinalPrice(dto.basePriceCents, dto.discountPercent ?? 0);
    const product = this.productRepo.create({ ...dto, finalPriceCents });
    return this.productRepo.save(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) throw new NotFoundException('Product not found');
    Object.assign(product, dto);
    if (dto.basePriceCents !== undefined || dto.discountPercent !== undefined) {
      product.finalPriceCents = this.computeFinalPrice(
        product.basePriceCents,
        product.discountPercent,
      );
    }
    return this.productRepo.save(product);
  }

  async softDelete(id: string) {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) throw new NotFoundException('Product not found');
    await this.productRepo.softDelete(id);
  }

  // ── Images ─────────────────────────────────────────────────────────────
  async addImage(productId: string, file: Express.Multer.File) {
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('Product not found');

    const hasImages = await this.imageRepo.count({ where: { productId } });
    const url = `/uploads/products/${file.filename}`;
    const image = this.imageRepo.create({ productId, url, isPrimary: hasImages === 0, altText: product.name });
    return this.imageRepo.save(image);
  }

  async removeImage(productId: string, imageId: string) {
    const image = await this.imageRepo.findOne({ where: { id: imageId, productId } });
    if (!image) throw new NotFoundException('Image not found');
    // __dirname at runtime = apps/api/dist/products/ → up 2 = apps/api/uploads/products
    const filepath = path.join(__dirname, '..', '..', 'uploads', 'products', path.basename(image.url));
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    await this.imageRepo.remove(image);
    if (image.isPrimary) {
      const next = await this.imageRepo.findOne({ where: { productId }, order: { sortOrder: 'ASC' } });
      if (next) { next.isPrimary = true; await this.imageRepo.save(next); }
    }
  }

  async reorderImages(productId: string, dto: ReorderDto) {
    await Promise.all(dto.items.map((item) => this.imageRepo.update(item.id, { sortOrder: item.sortOrder })));
  }

  // ── Variants ────────────────────────────────────────────────────────────
  async addVariant(productId: string, dto: CreateVariantDto) {
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('Product not found');
    const variant = this.variantRepo.create({ ...dto, productId });
    const saved = await this.variantRepo.save(variant);
    await this.syncStockTotal(productId);
    return saved;
  }

  async updateVariant(productId: string, variantId: string, dto: Partial<CreateVariantDto>) {
    const variant = await this.variantRepo.findOne({ where: { id: variantId, productId } });
    if (!variant) throw new NotFoundException('Variant not found');
    Object.assign(variant, dto);
    const saved = await this.variantRepo.save(variant);
    await this.syncStockTotal(productId);
    return saved;
  }

  async deleteVariant(productId: string, variantId: string) {
    const variant = await this.variantRepo.findOne({ where: { id: variantId, productId } });
    if (!variant) throw new NotFoundException('Variant not found');
    await this.variantRepo.remove(variant);
    await this.syncStockTotal(productId);
  }

  async updateStock(productId: string, dto: UpdateStockDto) {
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('Product not found');
    for (const upd of dto.updates) {
      const variant = await this.variantRepo.findOne({ where: { id: upd.variantId, productId } });
      if (!variant) continue;
      variant.stockQty = upd.stockQty;
      await this.variantRepo.save(variant);
      if (upd.stockQty <= product.lowStockThreshold) {
        this.notifications.emitLowStock({
          productId,
          productName: product.name,
          variantId: variant.id,
          sku: variant.sku,
          stockQty: upd.stockQty,
        });
      }
    }
    await this.syncStockTotal(productId);
  }

  private async syncStockTotal(productId: string) {
    const result = await this.variantRepo
      .createQueryBuilder('v')
      .select('SUM(v.stock_qty)', 'total')
      .where('v.product_id = :productId', { productId })
      .getRawOne<{ total: string }>();
    await this.productRepo.update(productId, { stockTotal: parseInt(result?.total ?? '0', 10) });
  }

  // ── CSV Import ──────────────────────────────────────────────────────────
  async importCsv(buffer: Buffer): Promise<{ imported: number; updated: number; errors: { row: number; reason: string }[] }> {
    const rows = parse(buffer, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];
    let imported = 0;
    let updated = 0;
    const errors: { row: number; reason: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;
      try {
        const category = await this.categoryRepo.findOne({ where: { slug: row.category_slug } });
        if (!category) { errors.push({ row: rowNum, reason: `Category '${row.category_slug}' not found` }); continue; }

        const subCategory = row.sub_category_slug
          ? await this.subCategoryRepo.findOne({ where: { slug: row.sub_category_slug } })
          : null;

        const tier = row.tier_slug
          ? await this.tierRepo.findOne({ where: { slug: row.tier_slug } })
          : null;

        const basePriceCents = Math.round(parseFloat(row.base_price_usd) * 100);
        const discountPercent = parseInt(row.discount_percent ?? '0', 10);
        const finalPriceCents = this.computeFinalPrice(basePriceCents, discountPercent);

        let product = await this.productRepo.findOne({ where: { slug: row.slug } });
        if (!product) {
          product = this.productRepo.create({
            name: row.name, slug: row.slug, categoryId: category.id,
            subCategoryId: subCategory?.id ?? null, tierId: tier?.id ?? null,
            description: row.description ?? null, isCottocool: row.is_cottocool === 'true',
            basePriceCents, discountPercent, finalPriceCents,
          });
          product = await this.productRepo.save(product);
          imported++;
        }

        // Upsert variant by SKU
        const existingVariant = await this.variantRepo.findOne({ where: { sku: row.sku } });
        if (existingVariant) {
          existingVariant.stockQty = parseInt(row.stock_qty ?? '0', 10);
          await this.variantRepo.save(existingVariant);
          updated++;
        } else {
          await this.variantRepo.save(this.variantRepo.create({
            productId: product.id, sku: row.sku, size: row.size,
            colour: row.colour ?? null, stockQty: parseInt(row.stock_qty ?? '0', 10),
          }));
        }
        await this.syncStockTotal(product.id);
      } catch (err) {
        errors.push({ row: rowNum, reason: (err as Error).message });
      }
    }
    return { imported, updated, errors };
  }

  // ── CSV Export ──────────────────────────────────────────────────────────
  async exportCsv(): Promise<string> {
    const products = await this.productRepo.find({
      where: { deletedAt: null as any },
      relations: { variants: true, category: true, subCategory: true, tier: true },
      order: { createdAt: 'DESC' },
    });

    const rows: Record<string, string | number | boolean>[] = [];
    for (const p of products) {
      for (const v of p.variants) {
        rows.push({
          name: p.name, slug: p.slug,
          category_slug: p.category?.slug ?? '',
          sub_category_slug: p.subCategory?.slug ?? '',
          tier_slug: p.tier?.slug ?? '',
          base_price_usd: (p.basePriceCents / 100).toFixed(2),
          discount_percent: p.discountPercent,
          is_cottocool: p.isCottocool,
          description: p.description ?? '',
          sku: v.sku, size: v.size, colour: v.colour ?? '', stock_qty: v.stockQty,
        });
      }
    }

    return stringify(rows, {
      header: true,
      columns: ['name','slug','category_slug','sub_category_slug','tier_slug','base_price_usd','discount_percent','is_cottocool','description','sku','size','colour','stock_qty'],
    });
  }
}
