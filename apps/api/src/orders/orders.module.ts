import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Address } from '../cart/entities/address.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { KothaIvrModule } from '../kotha-ivr/kotha-ivr.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order, OrderItem, OrderStatusHistory,
      Cart, CartItem, Address,
      Product, ProductVariant,
    ]),
    KothaIvrModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
