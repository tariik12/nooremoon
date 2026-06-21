import { IsString, IsUUID, IsOptional, IsBoolean, IsInt, Min, MaxLength, IsArray } from 'class-validator';

export class CreateSubCategoryDto {
  @IsUUID()
  categoryId: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @MaxLength(200)
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  heroImageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  showInNav?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;
}

export class AssignTiersDto {
  @IsArray()
  @IsUUID('4', { each: true })
  tierIds: string[];
}
