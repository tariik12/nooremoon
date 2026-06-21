import { IsString, IsOptional, IsInt, IsBoolean, IsDateString, Min, IsIn } from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  @IsIn(['percent', 'fixed'])
  type: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  discountPercent?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  discountCents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minOrderCents?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsBoolean()
  isFlashSale?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;
}
