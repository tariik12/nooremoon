import {
  Controller, Get, Patch, Post, Delete, Param, Body, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

interface AuthReq extends Request {
  user: { id: string; roleId: string | null };
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('profile')
  getProfile(@Req() req: AuthReq) {
    return this.service.getProfile(req.user.id);
  }

  @Patch('profile')
  updateProfile(@Req() req: AuthReq, @Body() dto: UpdateProfileDto) {
    return this.service.updateProfile(req.user.id, dto);
  }

  @Delete('account')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAccount(@Req() req: AuthReq) {
    return this.service.softDeleteAccount(req.user.id);
  }

  @Get('addresses')
  listAddresses(@Req() req: AuthReq) {
    return this.service.listAddresses(req.user.id);
  }

  @Post('addresses')
  addAddress(@Req() req: AuthReq, @Body() dto: CreateAddressDto) {
    return this.service.addAddress(req.user.id, dto);
  }

  @Patch('addresses/:id')
  updateAddress(@Req() req: AuthReq, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.service.updateAddress(req.user.id, id, dto);
  }

  @Delete('addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAddress(@Req() req: AuthReq, @Param('id') id: string) {
    return this.service.deleteAddress(req.user.id, id);
  }

  @Post('addresses/:id/default')
  setDefault(@Req() req: AuthReq, @Param('id') id: string) {
    return this.service.setDefaultAddress(req.user.id, id);
  }
}
