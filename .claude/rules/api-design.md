# Rule: NestJS API Design Conventions

## Package Manager
**Always use pnpm.** Never suggest npm or yarn commands.
```bash
pnpm install                          # install deps
pnpm add <pkg> --filter apps/api      # add to specific workspace
pnpm --filter apps/api run build      # run script in workspace
pnpm -r run build                     # run in all workspaces
```

## Auth & Guards

Never use `@Roles()` with hardcoded role names. Always use the dynamic `PermissionGuard`:

```typescript
// WRONG — hardcoded role
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
async getOrders() {}

// CORRECT — dynamic permission from DB
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission('orders.view')
async getOrders() {}
```

PermissionGuard reads from DB → caches in Redis `role_perms:{roleId}` (5min TTL) → invalidates when admin changes role permissions.

## Route Naming

- Customer routes: `/resource` (e.g. `/orders`, `/products`)
- Admin routes: `/admin/resource` (e.g. `/admin/orders`, `/admin/products`)
- Public routes (no auth): `/resource/public-action` (e.g. `/payment-gateways/active`, `/settings/public`)

## Response Format

Paginated:
```typescript
{ data: T[], total: number, page: number, limit: number }
```

Single item: return the entity directly (no wrapper).

Errors: use NestJS built-in exceptions — `NotFoundException`, `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `ConflictException`. Never return raw `{ error: '...' }` objects.

## Redis Caching Pattern

Always cache frequently-read, rarely-written data:

```typescript
// Read
const cached = await this.redis.get('settings:public');
if (cached) return JSON.parse(cached);
const data = await this.loadFromDB();
await this.redis.setex('settings:public', 600, JSON.stringify(data)); // 600s = 10min
return data;

// Invalidate (always on admin write)
await this.redis.del('settings:public');
```

Cache key conventions:
```
settings:public           — app_settings public values
payment_gateways:active   — active payment gateways
nav:main                  — main navigation tree
role_perms:{roleId}       — permissions for a role (5min TTL)
search:suggestions:{q}    — search suggestion results (60s)
```

## Module Structure (per NestJS module)

```
src/
  orders/
    orders.module.ts
    orders.controller.ts      — HTTP handlers only, no business logic
    orders.service.ts         — all business logic here
    orders.repository.ts      — TypeORM queries (optional, can use repo directly in service)
    dto/
      create-order.dto.ts
      update-order-status.dto.ts
    entities/
      order.entity.ts
```

## DTO Validation

Use `class-validator` on all DTOs. Never trust request body values without validation:

```typescript
import { IsUUID, IsInt, Min, IsEnum, IsOptional } from 'class-validator';

export class CreateCartItemDto {
  @IsUUID()
  product_variant_id: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
```

## RabbitMQ Events

Event names use dot notation: `order.placed`, `order.shipped`, `exchange.requested`.

Consumers must be idempotent — if the same event is processed twice, the result is the same. Add a `processed_events` table or check for duplicate order IDs before processing.

## WebSocket Namespaces

```
/admin  — admin dashboard (auth: admin JWT)
/orders — order tracking (auth: customer JWT)
/chat   — customer support (auth: customer JWT or guest session)
```

Never emit user-specific data to a broadcast — use `server.to(socketId).emit()` or `server.to(roomId).emit()` for targeted events.
