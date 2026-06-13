# Sprint 0 — Project Setup
**Workflow file for Claude Code**

## Goal
Scaffold the full monorepo with Next.js 16 frontend, NestJS backend, PostgreSQL, Redis, RabbitMQ, and Strapi CMS, all running in Docker. Configure Cloudflare DNS. Set up environment variables.

## Prerequisites
- VPS credentials available
- Domain `nooremoon.global` registered and pointing to Cloudflare nameservers
- Docker Desktop installed on dev machine
- Node.js 20+ installed

---

## Step 1 — Create the monorepo

```bash
mkdir nooremoon && cd nooremoon
npm init -y
npx create-turbo@latest . --use-npm
```

Target structure:
```
nooremoon/
├── apps/
│   ├── web/       # Next.js 16
│   └── api/       # NestJS
├── packages/
│   └── shared/    # Shared types + DTOs
├── docker-compose.yml
├── docker-compose.prod.yml
└── .env.example
```

---

## Step 2 — Scaffold Next.js 16 frontend

```bash
cd apps
npx create-next-app@latest web \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"
cd web
npm install @reduxjs/toolkit react-redux axios socket.io-client
npm install @stripe/stripe-js @stripe/react-stripe-js
npm install swiper react-hot-toast
```

---

## Step 3 — Scaffold NestJS backend

```bash
cd apps
npx @nestjs/cli new api --package-manager npm
cd api
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/config @nestjs/jwt @nestjs/passport
npm install passport passport-jwt passport-local passport-google-oauth20 passport-facebook
npm install amqplib amqp-connection-manager @nestjs/microservices
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install bcrypt class-validator class-transformer
npm install ioredis @nestjs/cache-manager cache-manager-redis-yet
npm install nodemailer @nestjs-modules/mailer handlebars
npm install multer @nestjs/platform-express
npm install stripe uuid
npm install --save-dev @types/bcrypt @types/multer @types/nodemailer @types/passport-jwt
```

---

## Step 4 — Create shared package

```bash
cd packages/shared && npm init -y && mkdir src && touch src/index.ts
```

**Important design rule:** Only things that are genuinely fixed workflow states are TypeScript enums. Anything the admin can add/edit/delete from the dashboard is stored in the database — never hardcoded.

`packages/shared/src/index.ts`:
```typescript
// ─── Fixed workflow state enums (these never change at runtime) ───────────────

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

// ─── NOT enums — these live in the database and are CRUD-managed ──────────────
//
// UserRole     → `roles` table          (admin can create new roles)
// TierName     → `tiers` table          (admin can add/remove/rename tiers)
// Category     → `categories` table     (admin CRUD)
// SubCategory  → `sub_categories` table (admin CRUD)
//
// Never hardcode these values in application code.
// Always fetch them from the API / database.
// The admin dashboard provides full CRUD for all of the above.
```

---

## Step 5 — Docker Compose (development)

`docker-compose.yml` at project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: nooremoon_postgres
    environment:
      POSTGRES_DB: nooremoon_db
      POSTGRES_USER: nooremoon
      POSTGRES_PASSWORD: changeme
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nooremoon"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: nooremoon_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: nooremoon_rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

  strapi:
    image: strapi/strapi
    container_name: nooremoon_strapi
    environment:
      DATABASE_CLIENT: postgres
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: nooremoon_strapi
      DATABASE_USERNAME: nooremoon
      DATABASE_PASSWORD: changeme
      JWT_SECRET: strapi-jwt-secret-change-me
    ports:
      - "1337:1337"
    volumes:
      - strapi_data:/srv/app
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
  strapi_data:
```

---

## Step 6 — Environment variables

Copy the env template from `workflows/00_master_build_guide.md` to `.env`. For dev, fill in at minimum:
- `DB_*` values matching docker-compose
- `JWT_SECRET` and `JWT_REFRESH_SECRET` — generate with `openssl rand -hex 64`
- `SMTP_*` — use Mailtrap for dev (free, catches all outgoing emails)
- Leave payment keys empty until Sprint 7

---

## Step 7 — NestJS AppModule wiring

`apps/api/src/app.module.ts` must wire up:
```
ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' })
TypeOrmModule.forRootAsync — load DB config from ConfigService
CacheModule (Redis) — global
```

Key TypeORM settings:
```typescript
{
  type: 'postgres',
  synchronize: false,     // NEVER true — always use migrations
  autoLoadEntities: true,
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,
}
```

---

## Step 8 — Cloudflare DNS setup

1. Add site `nooremoon.global` to Cloudflare → copy nameservers to your registrar.
2. DNS records:
   ```
   A    @        <VPS IP>      Proxied ✓
   A    www      <VPS IP>      Proxied ✓
   A    api      <VPS IP>      Proxied ✓
   A    cms      <VPS IP>      Proxied ✓  (Strapi)
   ```
3. SSL/TLS → Full (strict) mode.
4. Always Use HTTPS → ON.
5. Auto Minify → JS + CSS + HTML → ON.
6. Browser Cache TTL → 4 hours.

---

## Step 9 — Start dev environment

```bash
docker compose up -d
cd apps/api && npm run start:dev
cd apps/web && npm run dev
```

URLs:
- Frontend: http://localhost:3000
- API: http://localhost:3001/api/v1
- Strapi CMS: http://localhost:1337/admin
- RabbitMQ: http://localhost:15672
- Redis: localhost:6379

---

## Done When
- [ ] `docker compose up -d` runs all services with no errors
- [ ] `http://localhost:3000` shows Next.js starter page
- [ ] `http://localhost:3001/api/v1` returns 200
- [ ] `http://localhost:1337/admin` shows Strapi setup wizard
- [ ] `http://localhost:15672` shows RabbitMQ management UI
- [ ] `.env` populated for all dev values
- [ ] Cloudflare DNS configured for `nooremoon.global`
- [ ] Git repo initialised; `.env`, `node_modules`, `dist` are in `.gitignore`
- [ ] Shared package exports only fixed-state enums — roles/tiers/categories are DB-only
