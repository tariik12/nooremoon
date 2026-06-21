import { IsArray, IsUUID, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class StockUpdate {
  @IsUUID()
  variantId: string;

  @IsInt()
  @Min(0)
  stockQty: number;
}

export class UpdateStockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockUpdate)
  updates: StockUpdate[];
}
