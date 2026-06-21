import { Controller, Get, Post, Delete, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('users/wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistsController {
  constructor(private readonly service: WishlistsService) {}

  @Get()
  list(@Req() req: any) {
    return this.service.list(req.user.id);
  }

  @Post(':productId')
  add(@Req() req: any, @Param('productId') productId: string) {
    return this.service.add(req.user.id, productId);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Req() req: any, @Param('productId') productId: string) {
    return this.service.remove(req.user.id, productId);
  }

  @Get('ids')
  getIds(@Req() req: any) {
    return this.service.getProductIds(req.user.id);
  }
}
