import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { IsString, IsEmail, MinLength, MaxLength, IsOptional } from 'class-validator';
import { AppService } from './app.service';

class ContactDto {
  @IsString() @MinLength(1) @MaxLength(80) firstName!: string;
  @IsString() @MinLength(1) @MaxLength(80) lastName!: string;
  @IsString() @MinLength(5) @MaxLength(30) phone!: string;
  @IsEmail() @MaxLength(200) email!: string;
  @IsString() @MinLength(10) @MaxLength(2000) message!: string;
  @IsOptional() @IsString() @MaxLength(10) countryCode?: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('contact')
  async submitContact(@Body() dto: ContactDto) {
    if (!dto.firstName || !dto.email || !dto.message) {
      throw new BadRequestException('firstName, email and message are required');
    }
    // Contact submissions are received — email delivery can be wired to the
    // email_templates / email_logs system when an SMTP provider is configured.
    return { success: true, message: 'Your message has been received. We will get back to you soon.' };
  }
}
