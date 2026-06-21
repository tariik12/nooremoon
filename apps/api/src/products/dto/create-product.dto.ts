import { IsString, IsUUID, IsOptional, IsBoolean, IsInt, Min, Max, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(300)
  name: string;

  @IsString()
  @MaxLength(300)
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  careInstructions?: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsUUID()
  subCategoryId?: string;

  @IsOptional()
  @IsUUID()
  tierId?: string;

  @IsOptional()
  @IsBoolean()
  isCottocool?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFlashSale?: boolean;

  @IsInt()
  @Min(0)
  basePriceCents: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsInt()
  @Min(5)
  lowStockThreshold?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;
}
