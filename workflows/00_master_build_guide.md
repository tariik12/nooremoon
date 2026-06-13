# NOOREMOON — Master Build Guide
## How to Build This Project with Claude Code

---

## Overview

You are building **NOOREMOON** (nooremoon.global) — a high-end fashion e-commerce platform — using Claude Code as your primary development partner. This guide tells you the exact sequence to follow, how to use each workflow file, and how to start each Claude Code session correctly.

**Stack:**
- **Frontend:** Next.js 16 (App Router), Tailwind CSS, Redux Toolkit
- **Backend:** NestJS, REST API + WebSocket (Socket.IO)
- **Database:** PostgreSQL + Redis (cache/sessions)
- **Message Bus:** RabbitMQ
- **Payment:** Stripe (with 2FA) + bKash + Bangladesh EPS
- **CDN:** AWS CloudFront (not required for initial launch — add later)
- **Auth:** JWT + bcrypt, OTP via SYSSMS, Social Login via OAuth2 (Google, Facebook)
- **Email:** SMTP (any provider — Mailtrap for dev, production SMTP credentials from client)
- **CMS:** Strapi (self-hosted, recommended) OR custom admin panel (decide Sprint 1)
- **DNS / Proxy:** Cloudflare (DNS, DDoS protection, SSL termination)
- **Hosting:** VPS for backend (NestJS + PostgreSQL + Redis + RabbitMQ) + VPS or Vercel for frontend
- **Containers:** Docker + Docker Compose
- **Real-time:** Socket.IO for admin dashboard notifications, live chat, messaging system

---

## How to Use Claude Code on This Project

### Starting a New Session

At the start of every Claude Code session, paste this context block into the chat:

```
We are building NOOREMOON — a high-end fashion e-commerce platform at nooremoon.global.

Stack:
- Frontend: Next.js 16 (App Router), Tailwind CSS, Redux Toolkit
- Backend: NestJS + PostgreSQL + Redis + RabbitMQ + Socket.IO
- Payments: Stripe (2FA) + bKash + Bangladesh EPS
- Auth: JWT + bcrypt + OTP (SYSSMS) + Google/Facebook OAuth2
- Email: SMTP
- CMS: Strapi (self-hosted)
- Server: VPS + Cloudflare DNS
- Containers: Docker + Docker Compose

Read the SRS at: output/NOOREMOON_SRS_v1.0_Final.md
Today we are working on: [NAME THE SPRINT — e.g. "Sprint 3: Auth Module (workflows/03_auth_module.md)"]
Read that workflow file and follow it step by step.
```

### Rules for Every Session
1. Always read the relevant workflow file first before writing any code.
2. **Use pnpm** for all package operations — never npm or yarn.
3. Keep all business logic in the NestJS backend — Next.js is presentation only.
4. Never store card data — Stripe handles everything. bKash and EPS integrations must also not store sensitive credentials in the DB.
5. All exchange/discount/Flash Sale business rules must be enforced **server-side**, not just on the UI.
6. Socket.IO events must be namespaced (e.g. `/admin`, `/chat`, `/orders`).
7. Every new NestJS module must have a corresponding migration file.
8. Nothing is hardcoded — all business config comes from the DB (see `.claude/rules/dynamic-first.md`).

### Claude Commands Available in This Project
| Command | What It Does |
|---------|-------------|
| `/sprint <N>` | Load and start sprint N from its workflow file |
| `/new-migration <Name>` | Scaffold a TypeORM migration and run it |
| `/new-module <Name>` | Scaffold a full NestJS module with correct conventions |
| `/check-dynamic` | Scan for hardcoded values that should be DB-driven |
| `/review` | Code review against project principles |

---

## Sprint Sequence

Work through sprints in order. Do not start Sprint N+1 until Sprint N is working and tested.

| Sprint | Workflow File | What Gets Built | Prerequisite |
|--------|---------------|-----------------|--------------|
| 0 | `01_project_setup.md` | Monorepo, Docker, DB, Cloudflare DNS setup, env vars, CI skeleton | Nothing |
| 1 | `02_database_schema.md` | Full PostgreSQL schema: users, products, orders, taxonomy, loyalty, gift cards, messaging | Sprint 0 done |
| 2 | `03_auth_module.md` | Registration, login, JWT refresh, OTP, Google/Facebook OAuth2 | Sprint 1 done |
| 3 | `04_product_catalogue.md` | 3-level taxonomy CRUD, CottoCool flag, Strapi CMS setup, admin API | Sprint 1 done |
| 4 | `05_product_pages.md` | PLP (filters/sort/grid) + PDP (gallery, size guide modal, Add to Bag) | Sprint 3 done |
| 5 | `06_search.md` | Global search, as-you-type suggestions, /search results PLP | Sprint 4 done |
| 6 | `07_shopping_bag.md` | Cart (guest + auth), local storage merge, live badge via Socket.IO | Sprint 2 done |
| 7 | `08_checkout_stripe.md` | 5-step checkout, Stripe + bKash + EPS payment, 2FA, gift card, customs disclaimer | Sprints 2+6 done |
| 8 | `09_order_management.md` | Order history, tracking, SMTP email notifications, cancellation window, exchange request | Sprint 7 done |
| 9 | `10_loyalty_giftcards.md` | Points earning/redemption, tiered levels, gift card purchase + redemption | Sprint 8 done |
| 10 | `11_admin_panel.md` | Full admin dashboard: products, orders, CMS, promotions, Flash Sales, reporting + Socket.IO notifications + messaging | Sprints 3+8 done |
| 11 | `12_cms_content_pages.md` | All CMS-driven policy/content pages (size guide, loyalty, about us, store locations, etc.) | Sprint 10 done |
| 12 | `13_navigation_megamenu.md` | Mega-menu, sticky header, hamburger mobile menu, dynamic nav from dashboard | Sprint 4 done |
| 13 | `14_seasonal_collections.md` | Eid/SS26 collection pages, archive mechanism, CMS management | Sprint 12 done |
| 14 | `15_pwa_mobile.md` | PWA manifest, push notifications, biometric auth, deep linking | Sprint 12 done |
| 15 | `16_seo_performance.md` | Meta tags, Core Web Vitals optimisation, image optimisation (WebP), Cloudflare caching | Sprint 12 done |
| 16 | `17_testing_launch.md` | E2E test checklist, known issues resolution, pre-launch audit, VPS deployment | All sprints done |

---

## Project Folder Structure

```
nooremoon/
├── apps/
│   ├── web/                      # Next.js 16 frontend
│   │   ├── app/                  # App Router pages
│   │   │   ├── (shop)/           # Public shop routes
│   │   │   ├── (auth)/           # Auth routes
│   │   │   ├── profile/          # User profile
│   │   │   ├── admin/            # Admin panel routes
│   │   │   └── api/              # Next.js API routes (minimal — proxy to NestJS)
│   │   ├── components/           # Shared UI components
│   │   │   ├── layout/           # Header, Footer, MegaMenu
│   │   │   ├── product/          # ProductCard, ProductGallery, SizeGuide
│   │   │   ├── cart/             # CartDrawer, CartItem
│   │   │   └── ui/               # Button, Input, Modal, Badge, etc.
│   │   ├── store/                # Redux Toolkit store + slices
│   │   ├── hooks/                # Custom React hooks
│   │   ├── lib/                  # API client, utils
│   │   └── public/               # Static assets (logo, icons)
│   │
│   └── api/                      # NestJS backend
│       ├── src/
│       │   ├── auth/             # JWT, OTP, OAuth2
│       │   ├── users/            # User profile, address book
│       │   ├── products/         # Product CRUD, taxonomy
│       │   ├── categories/       # Category/SubCategory/Tier management
│       │   ├── search/           # Full-text search
│       │   ├── cart/             # Cart management
│       │   ├── checkout/         # Checkout flow
│       │   ├── payments/         # Stripe, bKash, EPS
│       │   ├── orders/           # Order management, tracking
│       │   ├── exchange/         # Exchange request workflow
│       │   ├── loyalty/          # Points, tiers
│       │   ├── gift-cards/       # Gift card purchase + redemption
│       │   ├── cms/              # CMS content pages (Strapi integration)
│       │   ├── seasonal/         # Seasonal collections management
│       │   ├── admin/            # Admin-only endpoints + reporting
│       │   ├── notifications/    # Socket.IO notification service
│       │   ├── messaging/        # Admin ↔ customer messaging
│       │   ├── email/            # SMTP email service
│       │   ├── sms/              # SYSSMS OTP service
│       │   ├── uploads/          # File upload (images → S3/VPS)
│       │   └── common/           # Guards, decorators, interceptors, pipes
│       ├── migrations/           # TypeORM migrations
│       └── test/
│
├── packages/
│   └── shared/                   # Shared TypeScript types, DTOs, enums
│
├── docker-compose.yml            # Dev environment
├── docker-compose.prod.yml       # Production
├── .env.example                  # Template — copy to .env
├── output/
│   └── NOOREMOON_SRS_v1.0_Final.md
├── workflows/                    # This folder
└── resources/                    # Brand assets, reference docs
```

---

## Environment Variables Template

Copy `.env.example` to `.env` and fill in values as each sprint adds new integrations.

```env
# ─── App ───────────────────────────────────────
NODE_ENV=development
APP_URL=http://localhost:3000
API_URL=http://localhost:3001
API_PREFIX=api/v1

# ─── Database ──────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nooremoon_db
DB_USER=nooremoon
DB_PASSWORD=changeme
DB_SYNCHRONIZE=false          # Always false in prod — use migrations

# ─── Redis ─────────────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ─── RabbitMQ ──────────────────────────────────
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_ORDER_QUEUE=order_events
RABBITMQ_NOTIFICATION_QUEUE=notifications

# ─── JWT ───────────────────────────────────────
JWT_SECRET=replace-with-64-char-random-string
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace-with-another-64-char-random-string
JWT_REFRESH_EXPIRES_IN=30d

# ─── SMTP Email ────────────────────────────────
SMTP_HOST=smtp.yourmailprovider.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=yourpassword
SMTP_FROM=support@nooremoon.global

# ─── SYSSMS (OTP / SMS) ────────────────────────
SYSSMS_API_KEY=
SYSSMS_SENDER_ID=NOOREMOON

# ─── Stripe ────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ─── bKash ─────────────────────────────────────
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_APP_KEY=
BKASH_APP_SECRET=
BKASH_USERNAME=
BKASH_PASSWORD=

# ─── Bangladesh EPS ────────────────────────────
EPS_MERCHANT_ID=
EPS_SECRET_KEY=
EPS_BASE_URL=

# ─── Google OAuth ──────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback

# ─── Facebook OAuth ────────────────────────────
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_CALLBACK_URL=http://localhost:3001/api/v1/auth/facebook/callback

# ─── File Storage (VPS local or S3) ────────────
UPLOAD_DEST=local                 # 'local' or 's3'
UPLOAD_MAX_SIZE_MB=10
# If s3:
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET=nooremoon-assets

# ─── Google Maps ───────────────────────────────
GOOGLE_MAPS_API_KEY=

# ─── Strapi CMS ────────────────────────────────
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=

# ─── Socket.IO ─────────────────────────────────
SOCKET_CORS_ORIGIN=http://localhost:3000

# ─── Admin ─────────────────────────────────────
ADMIN_EMAIL=admin@nooremoon.global
ADMIN_PASSWORD=changeme           # Change before deploy
```

---

## Tech Decisions Summary

| Decision | Choice | Reason |
|----------|--------|--------|
| Frontend | Next.js 16 App Router | SSR/SSG for SEO + performance |
| Backend | NestJS | Modular, typed, scalable |
| Database | PostgreSQL | Relational model fits e-commerce perfectly |
| Cache | Redis | Sessions, cart, search cache, rate limiting |
| Message Bus | RabbitMQ | Order events, async email/SMS notifications |
| Payment | Stripe + bKash + EPS | Global cards + Bangladesh local payment |
| CMS | Strapi (self-hosted) | No-code content editing for non-technical staff |
| Auth | JWT refresh tokens | Stateless, mobile-compatible |
| OTP / SMS | SYSSMS | Client-confirmed integration |
| CDN | Cloudflare (DNS/proxy) | SSL, DDoS protection, caching — CloudFront later if needed |
| Real-time | Socket.IO | Dashboard notifications, live order updates, messaging |
| Containers | Docker Compose | Consistent dev/prod environment |

---

## Socket.IO Namespaces

| Namespace | Who Uses It | Events |
|-----------|-------------|--------|
| `/admin` | Admin panel | `new_order`, `order_status_changed`, `new_exchange_request`, `low_stock_alert`, `new_message` |
| `/orders` | Authenticated customer | `order_status_update`, `delivery_update` |
| `/chat` | Customer + Support agent | `message`, `typing`, `read_receipt` |

---

## Payment Flow Summary

| Gateway | Use Case | Method |
|---------|----------|--------|
| Stripe | International cards (Visa, Mastercard, etc.) | Stripe Payment Intents + 2FA |
| bKash | Bangladesh mobile banking | bKash Tokenized Payment API |
| Bangladesh EPS | Bangladesh bank cards | EPS Merchant API |

All payment gateways redirect to a unified `/checkout/confirmation` endpoint on success.

---

## P1 Issues to Address (from SRS audit)

Build these into the relevant sprint — do not leave them for launch:

| Issue | Sprint | Status |
|-------|--------|--------|
| `/size-guide` CMS content missing | Sprint 11 | Pending |
| `/loyalty-program` content missing | Sprint 9 | Pending |
| `/gift-card-policy` content missing | Sprint 9 | Pending |
| `/about-us` content missing | Sprint 11 | Pending |
| `/store-locations` blank | Sprint 11 | Pending |
| Navigation inconsistency (seasonal items) | Sprint 12 | Pending |
| Closed-box vs T&C policy conflict | Resolve with client before Sprint 8 | Pending |
| No cancellation UI in Order History | Sprint 8 | Pending |
| SEO meta tags blank on all pages | Sprint 15 | Pending |

---

## Before You Start Sprint 0

Confirm these with the client and fill in `resources/`:
- [ ] Brand colour palette (is it dark navy `#1F4E79` + white, or different?)
- [ ] Logo files (SVG + PNG)
- [ ] Font choices
- [ ] VPS provider and server specs
- [ ] Domain registrar (for Cloudflare DNS setup)
- [ ] CMS choice confirmed: Strapi vs custom

---

*Open the sprint workflow file that matches your current sprint and follow it. Come back here when a sprint is done to pick the next one.*
