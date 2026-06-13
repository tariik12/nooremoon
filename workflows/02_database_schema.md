# Sprint 1 — Database Schema
**Workflow file for Claude Code**

## Goal
Design and create the complete PostgreSQL schema for NOOREMOON using TypeORM entities and migrations.

---

## Core Design Principle — Everything is Dynamic

**No content and no access control logic is hardcoded in the application.** Everything is stored in the database and managed from the admin dashboard — including user roles, permissions, and which routes/resources each role can access.

| What | Database Table | Who manages it |
|------|---------------|----------------|
| User roles | `roles` | Admin dashboard |
| Permissions (route/resource access) | `permissions` | Admin dashboard |
| Role ↔ Permission assignments | `role_permissions` | Admin dashboard |
| Product categories | `categories` | Admin dashboard |
| Sub-categories | `sub_categories` | Admin dashboard |
| Quality tiers | `tiers` | Admin dashboard |
| Products | `products` | Admin dashboard |
| Hero banners | `banners` | Admin/Marketing dashboard |
| Navigation items | `nav_items` | Admin dashboard |
| Seasonal collections | `seasons` | Admin/Marketing dashboard |
| Size guide charts | `size_guides` | Admin dashboard |
| CMS / policy pages | `cms_pages` | Admin dashboard |
| Store locations | `store_locations` | Admin dashboard |
| Loyalty tiers & rules | `loyalty_tiers` | Admin dashboard |
| Gift card denominations | `gift_card_templates` | Admin dashboard |
| Promotions & Flash Sales | `promotions` | Admin dashboard |

Only **workflow state enums** (order status, payment status) are TypeScript enums — because they drive backend logic and never change at runtime.

## Prerequisites
- Sprint 0 complete: Docker running, NestJS connected to PostgreSQL

---

## TypeScript Enums (fixed workflow states only)

```typescript
// packages/shared/src/enums.ts

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum ExchangeStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  BKASH = 'bkash',
  EPS = 'eps',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum NotificationEvent {
  ORDER_PLACED = 'order_placed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  LOW_STOCK = 'low_stock',
  NEW_EXCHANGE_REQUEST = 'new_exchange_request',
  NEW_MESSAGE = 'new_message',
}

export enum ConversationStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum LoyaltyTransactionType {
  EARNED = 'earned',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
}
```

---

## Database Tables

### RBAC — Roles & Permissions (fully dashboard-managed)

**`permissions`** — All available actions in the system; admin creates/manages these
```
id           uuid PK
key          varchar(100) unique   -- e.g. 'products.create', 'orders.view', 'cms.publish'
label        varchar(200)          -- human-readable label for dashboard UI
group        varchar(100)          -- e.g. 'Products', 'Orders', 'CMS', 'Customers'
description  varchar(500)
created_at   timestamp
updated_at   timestamp
```

Permission key naming convention: `resource.action`
Examples:
```
products.view, products.create, products.edit, products.delete
categories.view, categories.create, categories.edit, categories.delete
tiers.manage
orders.view, orders.update_status, orders.cancel
exchange.view, exchange.approve, exchange.reject
customers.view, customers.edit
cms.view, cms.publish, cms.unpublish
banners.manage
seasons.manage
loyalty.manage
gift_cards.manage
promotions.manage
reports.view
admin.manage_roles
admin.manage_users
```

**`roles`** — Admin creates, renames, deletes roles
```
id           uuid PK
name         varchar(100) unique
label        varchar(200)
description  varchar(500)
is_active    boolean default true
is_system    boolean default false   -- true for built-in roles (cannot be deleted)
created_at   timestamp
updated_at   timestamp
```

**`role_permissions`** — Junction: admin assigns permissions to roles from dashboard
```
role_id        FK → roles
permission_id  FK → permissions
PRIMARY KEY (role_id, permission_id)
granted_at     timestamp
granted_by     FK → users nullable
```

**`users`**
```
id                uuid PK
email             varchar(255) unique not null
password_hash     varchar(255) nullable
phone             varchar(50)
first_name        varchar(100)
last_name         varchar(100)
avatar_url        varchar(500)
role_id           FK → roles
is_email_verified boolean default false
is_active         boolean default true
last_login_at     timestamp
created_at        timestamp
updated_at        timestamp
deleted_at        timestamp nullable
```

**`refresh_tokens`**
```
id           uuid PK
user_id      FK → users
token_hash   varchar(500) unique
expires_at   timestamp
revoked_at   timestamp nullable
created_at   timestamp
```

**`otp_codes`**
```
id               uuid PK
user_id          FK → users nullable
phone_or_email   varchar(255)
code             varchar(10)
type             varchar(50)
expires_at       timestamp
used_at          timestamp nullable
created_at       timestamp
```

**`social_accounts`**
```
id           uuid PK
user_id      FK → users
provider     varchar(50)
provider_id  varchar(255)
created_at   timestamp
updated_at   timestamp
```

---

### How the Dynamic Permission Guard Works

In NestJS, the permission guard must:
1. Load the current user's role from the database (with permissions eager-loaded or from Redis cache)
2. Check that `user.role.permissions` contains the required permission key for the requested action
3. Return 403 if the permission is not present

```typescript
// apps/api/src/common/guards/permission.guard.ts
// The required permission key is set via a decorator: @RequirePermission('orders.view')
// The guard reads user.role.permissions from the DB (cached in Redis with 5min TTL).
// No role names are hardcoded — only permission keys.
```

Redis caches each role's permission set with a 5-minute TTL to avoid a DB query on every request. When admin changes a role's permissions from the dashboard, the cache for that role is invalidated immediately.

---

### Product Catalogue (all dashboard-managed)

**`categories`**
```
id               uuid PK
name             varchar(200) unique
slug             varchar(200) unique
description      text
hero_image_url   varchar(500)
nav_image_url    varchar(500)
icon_url         varchar(500)
is_active        boolean default true
show_in_nav      boolean default true
sort_order       integer default 0
meta_title       varchar(255)
meta_description varchar(500)
created_at       timestamp
updated_at       timestamp
```

**`sub_categories`**
```
id               uuid PK
category_id      FK → categories
name             varchar(200)
slug             varchar(200) unique
description      text
hero_image_url   varchar(500)
is_active        boolean default true
show_in_nav      boolean default true
sort_order       integer default 0
meta_title       varchar(255)
meta_description varchar(500)
created_at       timestamp
updated_at       timestamp
```

**`tiers`** — Dashboard: create, rename, reorder, deactivate
```
id           uuid PK
name         varchar(100) unique
slug         varchar(100) unique
description  varchar(500)
sort_order   integer default 0
is_active    boolean default true
created_at   timestamp
updated_at   timestamp
```

**`sub_category_tiers`** — Dashboard: assign tiers to sub-categories
```
sub_category_id  FK → sub_categories
tier_id          FK → tiers
PRIMARY KEY (sub_category_id, tier_id)
```

**`products`**
```
id                  uuid PK
name                varchar(300)
slug                varchar(300) unique
description         text
care_instructions   text
category_id         FK → categories
sub_category_id     FK → sub_categories
tier_id             FK → tiers nullable
is_cottocool        boolean default false
is_active           boolean default true
is_flash_sale       boolean default false
base_price_cents    integer
discount_percent    integer default 0
final_price_cents   integer
stock_total         integer default 0
low_stock_threshold integer default 5
meta_title          varchar(255)
meta_description    varchar(500)
created_at          timestamp
updated_at          timestamp
deleted_at          timestamp nullable
```

**`product_images`**
```
id          uuid PK
product_id  FK → products
url         varchar(500)
alt_text    varchar(255)
is_primary  boolean default false
sort_order  integer default 0
created_at  timestamp
```

**`product_variants`**
```
id                    uuid PK
product_id            FK → products
size                  varchar(20)
colour                varchar(100)
colour_hex            varchar(7)
sku                   varchar(100) unique
stock_qty             integer default 0
price_override_cents  integer nullable
created_at            timestamp
updated_at            timestamp
```

---

### Banners & Navigation (dashboard-managed)

**`banners`**
```
id          uuid PK
title       varchar(255)
subtitle    varchar(500)
image_url   varchar(500)
link_url    varchar(500)
page_type   varchar(50)         -- 'home' | 'category' | 'sub_category' | 'season'
page_id     uuid nullable
is_active   boolean default true
sort_order  integer default 0
starts_at   timestamp nullable
ends_at     timestamp nullable
created_at  timestamp
updated_at  timestamp
```

**`nav_items`** — Full nav tree, dashboard drag-and-drop
```
id          uuid PK
label       varchar(100)
url         varchar(500) nullable
type        varchar(50)              -- 'category' | 'season' | 'custom' | 'divider'
ref_id      uuid nullable
parent_id   FK → nav_items nullable
is_active   boolean default true
show_in_nav boolean default true
sort_order  integer default 0
created_at  timestamp
updated_at  timestamp
```

---

### Seasonal Collections (dashboard-managed)

**`seasons`**
```
id              uuid PK
name            varchar(200)
slug            varchar(200) unique
nav_label       varchar(100)
hero_image_url  varchar(500)
description     text
is_active       boolean default true
show_in_nav     boolean default true
starts_at       timestamp nullable
ends_at         timestamp nullable
archived_at     timestamp nullable
sort_order      integer default 0
created_at      timestamp
updated_at      timestamp
```

**`season_sub_collections`**
```
id               uuid PK
season_id        FK → seasons
label            varchar(200)
category_id      FK → categories nullable
sub_category_id  FK → sub_categories nullable
hero_image_url   varchar(500)
sort_order       integer default 0
is_active        boolean default true
created_at       timestamp
updated_at       timestamp
```

---

### Size Guides (dashboard-managed)

**`size_guides`**
```
id            uuid PK
garment_type  varchar(100)
style_fit     varchar(100)
gender        varchar(20)
unit          varchar(5)
chart_data    jsonb
is_active     boolean default true
sort_order    integer default 0
created_at    timestamp
updated_at    timestamp
```

---

### Cart & Orders

**`carts`** / **`cart_items`** / **`addresses`** — same as previous version

**`orders`**
```
id                           uuid PK
order_number                 varchar(50) unique
user_id                      FK → users
shipping_address_id          FK → addresses
status                       varchar(50)     -- OrderStatus values
payment_method               varchar(20)     -- PaymentMethod values
payment_status               varchar(20)     -- PaymentStatus values
subtotal_cents               integer
shipping_cents               integer
discount_cents               integer default 0
gift_card_applied_cents      integer default 0
total_cents                  integer
currency                     varchar(10) default 'USD'
stripe_payment_intent_id     varchar(255) nullable
bkash_payment_id             varchar(255) nullable
eps_transaction_id           varchar(255) nullable
tracking_number              varchar(255) nullable
courier_name                 varchar(100) nullable
service_centre_confirmed_at  timestamp nullable
cancellation_window_open     boolean default true
notes                        text
created_at                   timestamp
updated_at                   timestamp
```

**`order_items`** / **`order_status_history`** — same as previous version

---

### Exchange / Loyalty / Gift Cards / CMS / Promotions / Messaging / Notifications

Same structure as previous version — all managed from dashboard, no hardcoded values.

**`loyalty_tiers`** — Dashboard: create tiers, set point thresholds and rates
**`gift_card_templates`** — Dashboard: create denominations
**`cms_pages`** — Dashboard: publish/unpublish, edit content blocks
**`store_locations`** — Dashboard: full CRUD
**`promotions`** — Dashboard: create discount rules and Flash Sales
**`conversations`** + **`messages`** — messaging system
**`notifications`** — system notifications

---

## Migration Order

1. `CreatePermissionsRolesRolePermissions`
2. `CreateUsersRefreshTokensOtpSocial`
3. `CreateCategoriesSubCategoriesTiers`
4. `CreateBannersNavItems`
5. `CreateProducts`
6. `CreateSeasons`
7. `CreateSizeGuides`
8. `CreateCartAddressesOrders`
9. `CreateExchangeRequests`
10. `CreateLoyaltyAndGiftCards`
11. `CreateCmsAndStoreLocations`
12. `CreatePromotions`
13. `CreateMessagingAndNotifications`
14. `SeedPermissionsRolesAndAdmin`

---

## Seed Data (migration 14 only)

**Permissions (~30 rows)** — all `resource.action` keys listed above.

**Roles (4 rows):**
- `admin` (is_system: true) — all permissions
- `customer` (is_system: true) — none (customer access is handled separately, not via the permissions table)
- `support` — order/exchange/chat/customer management permissions
- `marketing` — CMS, banners, seasons, promotions permissions

**Default admin user:** 1 row using `ADMIN_EMAIL` + bcrypt(`ADMIN_PASSWORD`) from `.env`, assigned `admin` role.

**Everything else is entered via the admin dashboard.**

---

## Done When
- [ ] All 14 migrations run cleanly
- [ ] `permissions`, `roles`, `role_permissions` tables exist and are seeded
- [ ] Permission guard prototype works: non-admin user blocked from a protected route
- [ ] All other tables exist with correct FK constraints
- [ ] Default admin user can log in
- [ ] Redis caches role permissions on first load; cache is invalidated when role is updated
