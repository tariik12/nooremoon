import { IsString, IsOptional, IsUUID, IsBoolean, IsInt, Min, MaxLength } from 'class-validator';

export class CreateNavItemDto {
  @IsString()
  @MaxLength(100)
  label: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string;

  @IsString()
  @MaxLength(50)
  type: string;

  @IsOptional()
  @IsUUID()
  refId?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

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
}
