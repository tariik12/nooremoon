import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @MaxLength(20)
  size: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  colour?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  colourHex?: string;

  @IsString()
  @MaxLength(100)
  sku: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockQty?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceOverrideCents?: number;
}
