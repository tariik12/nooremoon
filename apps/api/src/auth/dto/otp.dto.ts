import { IsString, IsNotEmpty, Length } from 'class-validator';

export class OtpRequestDto {
  @IsString()
  @IsNotEmpty()
  phoneOrEmail: string;
}

export class OtpVerifyDto {
  @IsString()
  @IsNotEmpty()
  phoneOrEmail: string;

  @IsString()
  @Length(6, 6)
  code: string;
}
