import {
  Controller, Get, Post, Patch, Delete, Param, Body, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

interface AuthRequest extends Request {
  user?: { id: string };
}

function resolveIdentity(req: AuthRequest): { userId: string | null; sessionId: string } {
  const userId = (req as any).user?.id ?? null;
  const sessionId = (req.headers['x-session-id'] as string) || uuidv4();
  return { userId, sessionId };
}

@Controller('cart')
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get()
  getCart(@Req() req: AuthRequest) {
    const { userId, sessionId } = resolveIdentity(req);
    return this.service.getCart(userId, sessionId);
  }

  @Post('items')
  addItem(@Req() req: AuthRequest, @Body() dto: AddToCartDto) {
    const { userId, sessionId } = resolveIdentity(req);
    return this.service.addItem(userId, sessionId, dto);
  }

  @Patch('items/:itemId')
  updateItem(
    @Req() req: AuthRequest,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const { userId, sessionId } = resolveIdentity(req);
    return this.service.updateItem(userId, sessionId, itemId, dto);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  removeItem(@Req() req: AuthRequest, @Param('itemId') itemId: string) {
    const { userId, sessionId } = resolveIdentity(req);
    return this.service.removeItem(userId, sessionId, itemId);
  }
}
