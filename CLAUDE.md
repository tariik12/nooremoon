# NOOREMOON — Claude Code Project Instructions

## What This Project Is
A re-sellable premium fashion e-commerce platform. The first deployment is NOOREMOON (nooremoon.global), but the platform will be sold to other businesses. **This shapes every decision: nothing is hardcoded for NOOREMOON specifically.**

## Tech Stack
- **Frontend:** Next.js 16 (App Router), Tailwind CSS, Redux Toolkit — `apps/web/`
- **Backend:** NestJS — `apps/api/`
- **Shared:** `packages/shared/` — only fixed workflow state enums (OrderStatus, PaymentStatus, etc.)
- **DB:** PostgreSQL 16 (TypeORM, migrations-only) + Redis (cache/sessions) + RabbitMQ (async)
- **Auth:** JWT (15min access / 30day refresh) + bcrypt + SYSSMS OTP + Google/Facebook OAuth2
- **Payments:** Stripe + bKash + Bangladesh EPS — all dynamic via `payment_gateways` table
- **CMS:** Strapi (self-hosted)
- **Infra:** Docker + Docker Compose, Cloudflare (DNS/SSL/WAF/CDN)
- **Realtime:** Socket.IO namespaces: `/admin`, `/orders`, `/chat`

## The #1 Rule — Everything Is Dynamic
If a value could be different for another business client, it MUST come from the database. Never hardcode:
- Role names or permissions → `roles`, `permissions`, `role_permissions` tables
- Tier names → `tiers` table
- Shipping rates or thresholds → `app_settings` table
- Payment methods → `payment_gateways` table
- Nav structure → `nav_items` table
- Banner content → `banners` table
- Email template text → `email_templates` table
- Any configurable text → `app_settings` or `cms_pages` table

See `.claude/rules/dynamic-first.md` for full guidance.

## Monorepo Structure
```
apps/
  web/          Next.js 16 frontend
  api/          NestJS backend
packages/
  shared/       State enums only (OrderStatus, PaymentStatus, ExchangeStatus, PaymentMethod)
workflows/      Sprint recipe files (the build guide — read before each sprint)
output/         Deliverables (SRS, reports)
resources/      Reference docs
```

## How to Build This Project
1. Read `workflows/00_master_build_guide.md` first
2. For each sprint, read the matching `workflows/NN_*.md` file
3. Use `/sprint NN` command to begin a sprint session
4. Use `/new-migration <name>` command to scaffold TypeORM migrations

## Database Rules
- `synchronize: false` always — only migrations touch schema
- Run migrations: `npm run migration:run --workspace=apps/api`
- Create migration: use `/new-migration <name>` command
- Money stored as integers (cents/pence) — never floats
- All timestamps: `timestamp with time zone`

## API Design Rules
- Route guards use dynamic `PermissionGuard` — never `@Roles('admin')`
- Every admin endpoint requires a `permission` key (e.g. `@RequirePermission('orders.manage')`)
- Paginated endpoints: `?page=1&limit=20` → return `{ data, total, page, limit }`
- Cache invalidation: whenever admin updates any cached data, Redis key must be deleted

## Package Manager
**pnpm** — always. Never npm or yarn.

## Git Bash
All terminal commands in this project run in **Git Bash** (not PowerShell).
