import { IsString, IsOptional, IsEnum, IsNotEmpty, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@nooremoon/shared';

export class ShippingAddressDto {
  @IsString() @IsNotEmpty()
  fullName: string;

  @IsString() @IsNotEmpty()
  phone: string;

  @IsString() @IsNotEmpty()
  addressLine1: string;

  @IsOptional() @IsString()
  addressLine2?: string;

  @IsString() @IsNotEmpty()
  city: string;

  @IsOptional() @IsString()
  state?: string;

  @IsOptional() @IsString()
  postalCode?: string;

  @IsString() @IsNotEmpty()
  country: string;
}

export class CreateOrderDto {
  @IsString() @IsNotEmpty()
  sessionId: string;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  address: ShippingAddressDto;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional() @IsString()
  notes?: string;
}
