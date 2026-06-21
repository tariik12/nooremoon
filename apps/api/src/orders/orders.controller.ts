import { Controller, Post, Get, Patch, Param, Body, Req, UseGuards, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { Request } from 'express';
import { IsString, IsOptional } from 'class-validator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

class UpdateOrderStatusDto {
  @IsString() status!: string;
  @IsOptional() @IsString() note?: string;
  @IsOptional() @IsString() trackingNumber?: string;
  @IsOptional() @IsString() courierName?: string;
}

interface AuthRequest extends Request {
  user?: { id: string };
}

@Controller()
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post('orders')
  createOrder(@Body() dto: CreateOrderDto, @Req() req: AuthRequest) {
    const userId = (req as any).user?.id;
    return this.service.createOrder(dto, userId);
  }

  // Public — look up all orders by phone number
  @Get('orders/track')
  trackOrders(
    @Query('phone') phone: string,
    @Query('orderNumber') orderNumber?: string,
  ) {
    if (orderNumber) {
      return this.service.trackOrder(orderNumber, phone);
    }
    return this.service.trackOrdersByPhone(phone);
  }

  @Get('orders/my')
  @UseGuards(JwtAuthGuard)
  getMyOrders(
    @Req() req: AuthRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.service.findUserOrders((req as any).user.id, page, limit);
  }

  @Get('orders/:orderNumber/ivr-status')
  getIvrStatus(@Param('orderNumber') orderNumber: string) {
    return this.service.getIvrStatus(orderNumber);
  }

  @Post('orders/:orderNumber/ivr-fallback-confirm')
  ivrFallbackConfirm(@Param('orderNumber') orderNumber: string) {
    return this.service.ivrFallbackConfirm(orderNumber);
  }

  @Get('orders/:orderNumber')
  getOrder(@Param('orderNumber') orderNumber: string) {
    return this.service.findByOrderNumber(orderNumber);
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  @Get('admin/orders')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('orders.view')
  adminListOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.service.adminFindAll(page, limit, status, search);
  }

  @Get('admin/orders/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('orders.view')
  adminGetOrder(@Param('id') id: string) {
    return this.service.adminFindOne(id);
  }

  @Patch('admin/orders/:id/status')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('orders.update_status')
  adminUpdateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: any,
  ) {
    return this.service.adminUpdateStatus(id, dto.status, req.user.id, dto.note, dto.trackingNumber, dto.courierName);
  }
}
