# Rule: Everything Is Dashboard-Manageable

This platform is designed to be re-sold to other businesses. Every business rule, configuration value, and content item that could differ between clients MUST be stored in the database and editable from the admin dashboard. Nothing is hardcoded for NOOREMOON specifically.

## What Must Be Dynamic (never hardcode these in code)

| Thing | Where it lives | Cache |
|-------|---------------|-------|
| Role names | `roles` table | Redis `role_perms:{id}` 5min |
| Permission keys | `permissions` table | Redis `role_perms:{id}` 5min |
| Tier names | `tiers` table | — |
| Shipping flat rate | `app_settings` key `shipping_flat_rate_cents` | Redis `settings:public` 10min |
| Free shipping threshold | `app_settings` key `free_shipping_threshold_cents` | Redis `settings:public` 10min |
| Payment gateways | `payment_gateways` table | Redis `payment_gateways:active` 5min |
| Nav structure | `nav_items` table | Redis `nav:main` until admin changes |
| Banner content | `banners` table | — |
| Email template text | `email_templates` table | Redis per key 5min |
| Customs disclaimer text | `app_settings` key `customs_disclaimer_text` | Redis `settings:public` 10min |
| Announcement bar text | `app_settings` key `announcement_bar_text` | Redis `settings:public` 10min |
| Loyalty points rate | `app_settings` key `loyalty_points_per_dollar` | Redis `settings:public` 10min |
| Loyalty tier thresholds | `loyalty_tiers` table | Redis 10min |
| Exchange window days | `app_settings` key `exchange_window_days` | Redis `settings:public` 10min |
| Support email | `app_settings` key `support_email` | Redis `settings:public` 10min |
| Social links | `app_settings` keys `instagram_url`, etc. | Redis `settings:public` 10min |
| CMS page content | `cms_pages` table or Strapi | Next.js ISR 1hr |
| Store locations | `store_locations` table | — |

## Only These Are Fixed in Code (acceptable hardcoding)

These are workflow states that represent business process stages — they are the same for every deployment:

```typescript
// packages/shared/src/enums.ts — the ONLY acceptable enums

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
}

export enum ExchangeStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  STRIPE = 'STRIPE',
  BKASH = 'BKASH',
  EPS = 'EPS',
  GIFT_CARD = 'GIFT_CARD',
  LOYALTY_POINTS = 'LOYALTY_POINTS',
}
```

**Never add UserRole, TierName, or any business-naming enum here.**

## How to Check Your Own Code

Before writing any hardcoded value, ask: "Would a second business using this platform need this to be different?" If yes → it goes in the database.

Red flags to reject immediately:
- `if (role === 'admin')` → use `PermissionGuard` instead
- `const SHIPPING_RATE = 25` → read from `app_settings`
- `tier: 'Legends Edit'` → load from `tiers` table
- `subject: 'Your order is confirmed'` → load from `email_templates`
- nav items listed in JSX → load from `nav_items` API
