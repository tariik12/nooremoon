# Rule: Database & TypeORM Conventions

## Non-Negotiable Rules

1. **`synchronize: false` always** — in every environment including development. Schema changes only happen through migrations.
2. **Money as integers** — all monetary values stored as cents/pence (integer). Never floats. `price_cents: integer`, not `price: decimal`.
3. **UUIDs as primary keys** — `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`. Never auto-increment integers.
4. **All timestamps** — `created_at timestamp with time zone DEFAULT now()`, `updated_at timestamp with time zone`.
5. **TypeORM migration files only** — never use `queryRunner.sync()` or schema sync in tests.

## TypeORM Entity Pattern

```typescript
// apps/api/src/orders/entities/order.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'subtotal_cents', type: 'integer' })
  subtotalCents: number;

  @Column({ name: 'status', type: 'varchar', length: 50 })
  status: OrderStatus;

  @Column({ name: 'cancellation_window_open', type: 'boolean', default: true })
  cancellationWindowOpen: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
```

## Migration Workflow

Create a migration:
```bash
# Use the /new-migration command, or manually:
pnpm --filter apps/api run migration:generate -- src/migrations/AddTrackingToOrders
```

Run migrations:
```bash
pnpm --filter apps/api run migration:run
```

Revert last migration:
```bash
pnpm --filter apps/api run migration:revert
```

## Migration Naming Convention

Format: `YYYYMMDDHHMMSS-PascalCaseName`
Examples:
- `1700000001-CreateUsersTable`
- `1700000002-AddSearchVectorToProducts`
- `1700000003-CreatePaymentGatewaysTable`

## Migration Order (Sprint 1 reference)

Never change this order — foreign key dependencies:
1. permissions
2. roles
3. role_permissions
4. users
5. loyalty_tiers
6. loyalty_accounts
7. loyalty_transactions
8. categories
9. sub_categories
10. tiers
11. products
12. product_images
13. product_variants
14. product_seasons
15. banners
16. nav_items
17. seasons
18. season_sub_collections
19. size_guides
20. carts
21. cart_items
22. addresses
23. payment_gateways
24. orders
25. order_items
26. order_status_history
27. exchange_requests
28. gift_card_templates
29. gift_cards
30. gift_card_redemptions
31. cms_pages
32. store_locations
33. promotions
34. conversations
35. messages
36. notifications
37. app_settings
38. email_templates
39. push_subscriptions
40. webauthn_credentials
41. wishlists
42. email_logs

## Seeding Rules

Seeds run after all migrations. Seeds are idempotent — use `INSERT ... ON CONFLICT DO NOTHING`:

```typescript
// Seed permissions
await queryRunner.query(`
  INSERT INTO permissions (key, description) VALUES
  ('orders.view', 'View all orders'),
  ('orders.manage', 'Update order status and details'),
  ('products.create', 'Create new products'),
  ('products.manage', 'Edit and delete products'),
  ('customers.view', 'View customer accounts'),
  ('admin.access', 'Access admin dashboard'),
  ('admin.manage_settings', 'Edit site settings'),
  ('payments.manage', 'Manage payment gateways'),
  ('email.manage', 'Edit email templates')
  ON CONFLICT (key) DO NOTHING;
`);
```

Seed only:
- All permission keys
- 4 default roles (Super Admin, Operations, Warehouse Staff, Content Editor)
- 1 admin user (credentials from env vars `ADMIN_EMAIL`, `ADMIN_PASSWORD`)

Never seed product data or customer data — that goes in via the admin dashboard.

## Query Performance

- Every foreign key column must have an index
- `products.search_vector` uses GIN index
- `orders.user_id` indexed
- `cart_items.cart_id` indexed
- For pagination: use `LIMIT` + `OFFSET` with an indexed `ORDER BY` column
- For large datasets: consider cursor-based pagination (use `id > lastId`)
