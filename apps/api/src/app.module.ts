import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './common/redis/redis.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CategoriesModule } from './categories/categories.module';
import { SubCategoriesModule } from './sub-categories/sub-categories.module';
import { TiersModule } from './tiers/tiers.module';
import { ProductsModule } from './products/products.module';
import { BannersModule } from './banners/banners.module';
import { NavModule } from './nav/nav.module';
import { SettingsModule } from './settings/settings.module';
import { RbacModule } from './rbac/rbac.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { PromotionsModule } from './promotions/promotions.module';
import { StoreLocationsModule } from './store-locations/store-locations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const base = {
          type: 'postgres' as const,
          synchronize: false,
          autoLoadEntities: true,
          migrations: ['dist/migrations/*.js'],
          migrationsRun: false,
          logging: config.get('NODE_ENV') === 'development',
          ssl: databaseUrl ? { rejectUnauthorized: false } : false,
        };
        if (databaseUrl) {
          return { ...base, url: databaseUrl };
        }
        return {
          ...base,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          database: config.get<string>('DB_NAME'),
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASSWORD'),
        };
      },
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    RedisModule,
    RbacModule,
    AuthModule,
    UsersModule,
    NotificationsModule,
    CategoriesModule,
    SubCategoriesModule,
    TiersModule,
    ProductsModule,
    BannersModule,
    NavModule,
    SettingsModule,
    CartModule,
    OrdersModule,
    WebhooksModule,
    WishlistsModule,
    PromotionsModule,
    StoreLocationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
