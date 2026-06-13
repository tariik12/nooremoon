# Sprint 16 — Testing & Launch
**Workflow file for Claude Code**

## Goal
End-to-end testing of the complete platform, resolution of all P1 known issues, Docker production build, VPS deployment, and go-live checklist.

## Prerequisites
- All Sprints 0–15 complete
- VPS provisioned (Ubuntu 22.04 LTS recommended)
- Domain `nooremoon.global` DNS pointing to VPS IP via Cloudflare

---

## P1 Known Issues Resolution

These are issues flagged from the original SRS that must be resolved before launch. Check each off:

**P1-001: Payment 2FA for Stripe**
- Stripe Elements already handles 3D Secure (SCA) natively when using PaymentIntent
- Verify by testing a card that triggers 3DS: use Stripe test card `4000 0025 0000 3155`
- Confirm the 3DS modal appears and order completes after authentication

**P1-002: OTP Fallback**
- If SYSSMS gateway fails (non-200 response), fall back to sending OTP via email (SMTP)
- Implement: wrap SYSSMS call in try/catch → on error, call email OTP send
- Log the fallback event to a `sms_logs` table

**P1-003: Gift Card Partial Redemption**
- Test: gift card balance £30, order total £25 → remaining balance £5 stays on card
- Test: gift card balance £15, order total £25 → only £15 deducted from card, £10 charged to gateway
- Verify `gift_card_redemptions` row shows correct amounts

**P1-004: Exchange Eligibility Edge Cases**
- Test all 5 exchange eligibility rules with boundary values:
  - Order exactly 7 days old (should be eligible)
  - Order exactly 8 days old (should be rejected)
  - Item with exactly 50% discount (rejected)
  - Item with 49% discount (eligible)
  - Flash sale item (rejected regardless of discount)

**P1-005: Cancellation Window**
- Test that "Cancel Order" button disappears after admin marks "Service Centre Confirmed"
- Test that trying to cancel via API after window closed returns 400 with correct message

**P1-006: Low Stock Threshold Per Product**
- `app_settings` has `low_stock_global_threshold` (default: 5)
- Products can override this with their own `low_stock_threshold` column (add if not already there)
- Socket.IO `low_stock_alert` emits correctly when stock drops below threshold

**P1-007: Authorised Recipient**
- Customer can designate a person to receive their delivery (`POST /orders/:id/authorised-recipient`)
- Fields: name, phone number, relationship
- Stored on order — shows on packing list PDF

**P1-008: Seasonal Collection Coming-Soon**
- Coming-soon page renders countdown and email capture for a pre-launch season
- Email captured to `collection_waitlist` table
- Admin can export waitlist from dashboard

**P1-009: Search Relevance**
- Verify full-text search returns relevant results (not just exact match)
- Test: search "panjabi" returns Panjabi products AND related sub-categories
- Test: search "blue panjabi" returns blue products (colour filtering in search)

**P1-010: Multi-Currency (Deferred)**
- Note: Multi-currency is deferred to v2. Add `currency_code` + `currency_symbol` to `app_settings` so the admin can set the store currency. All prices display in this currency. No real-time conversion at v1.

---

## End-to-End Test Flows

Run through each flow manually on staging before launch. Check each:

### Auth
- [ ] Register with email + OTP → verify email → login
- [ ] Login with wrong password (3 times) → account locked temporarily
- [ ] Forgot password → email link → reset password → login with new password
- [ ] Google OAuth2 login → lands on homepage as logged-in user
- [ ] Facebook OAuth2 login
- [ ] Biometric enroll on mobile → biometric login works

### Shopping
- [ ] Browse PLP → filter by size → sort by price → load more
- [ ] Search "panjabi" → suggestions appear → press Enter → results page
- [ ] Open PDP → select size → view size guide modal → Add to Bag
- [ ] Add same item twice → quantity updates in bag
- [ ] Guest cart: add item without login → login → guest items merged into account cart
- [ ] Add out-of-stock item → correct error shown

### Checkout
- [ ] Full Stripe checkout flow: address → shipping → Stripe card → review → confirm
- [ ] bKash checkout (if activated) → redirect → callback → order confirmed
- [ ] Apply gift card → partial discount applied → remainder charged to card
- [ ] Apply discount code → discount applied correctly
- [ ] Customs disclaimer visible on Step 2 and Step 4
- [ ] Order confirmation page shows order number
- [ ] Order confirmation email received via SMTP

### Orders
- [ ] Order appears in `/profile/orders` immediately after placement
- [ ] "Cancel Order" button visible → cancel → order status updates
- [ ] Admin marks "Service Centre Confirmed" → Cancel button disappears
- [ ] Admin adds tracking → customer sees it on order detail
- [ ] Admin updates status to Shipped → customer receives push notification + email
- [ ] Request exchange (valid) → form submits → admin sees in exchange queue
- [ ] Request exchange on Flash Sale item → rejected with reason

### Admin
- [ ] Create product → assign to category + tier → publish → appears on PLP
- [ ] Bulk CSV import → 10 products created → inventory correct
- [ ] Update `shipping_flat_rate_cents` in settings → shopping bag reflects new rate
- [ ] Disable bKash gateway → payment step no longer shows bKash tab
- [ ] Edit email template → send preview → preview email received
- [ ] Create Flash Sale → activate → countdown appears on relevant PDPs
- [ ] Flash Sale ends → countdown disappears, products revert to original price
- [ ] Role management: create "Warehouse Staff" role → assign `orders.view` only → login as warehouse staff → can see orders but not products

### Loyalty & Gift Cards
- [ ] Complete order → loyalty points awarded → appear in `/loyalty`
- [ ] Tier upgrade: manually set points to 500+ → tier upgrades to Silver
- [ ] Redeem points at checkout → discount applied
- [ ] Purchase gift card → recipient receives email with code
- [ ] Apply gift card code at checkout → balance deducted

### PWA
- [ ] Install to iOS home screen → opens as standalone app
- [ ] Install to Android home screen → opens as standalone app
- [ ] Go offline → navigate to a cached product → page loads from cache
- [ ] Go offline → navigate to uncached page → offline page shows

---

## Production Docker Build

### `docker-compose.prod.yml`
```yaml
version: '3.9'
services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    env_file: .env.production
    ports: ["3001:3001"]
    depends_on: [postgres, redis, rabbitmq]
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    env_file: .env.production
    ports: ["3000:3000"]
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    volumes: ["./nginx.conf:/etc/nginx/nginx.conf"]
    ports: ["80:80", "443:443"]
    depends_on: [web, api]
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    env_file: .env.production
    volumes: ["postgres_data:/var/lib/postgresql/data"]
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes: ["redis_data:/data"]
    restart: unless-stopped

  rabbitmq:
    image: rabbitmq:3-management-alpine
    env_file: .env.production
    volumes: ["rabbitmq_data:/var/lib/rabbitmq"]
    restart: unless-stopped

  strapi:
    image: strapi/strapi
    env_file: .env.production
    volumes: ["strapi_data:/srv/app"]
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
  strapi_data:
```

### Nginx Config (`nginx.conf`)
```nginx
server {
  listen 80;
  server_name nooremoon.global www.nooremoon.global;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  server_name nooremoon.global www.nooremoon.global;

  # SSL handled by Cloudflare (full strict mode) — use origin cert here
  ssl_certificate /etc/nginx/certs/nooremoon.global.pem;
  ssl_certificate_key /etc/nginx/certs/nooremoon.global.key;

  # Next.js frontend
  location / {
    proxy_pass http://web:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  # NestJS API
  location /api/ {
    proxy_pass http://api:3001/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  # WebSocket (Socket.IO)
  location /socket.io/ {
    proxy_pass http://api:3001/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

---

## Deployment Steps (Git Bash on VPS)

```bash
# 1. SSH into VPS
ssh user@your-vps-ip

# 2. Clone repo
git clone git@github.com:yourorg/nooremoon.git /var/www/nooremoon
cd /var/www/nooremoon

# 3. Copy production env
cp .env.example .env.production
# Edit .env.production with all real values

# 4. Run database migrations
docker compose -f docker-compose.prod.yml run --rm api npx typeorm migration:run

# 5. Seed database
docker compose -f docker-compose.prod.yml run --rm api npm run seed

# 6. Start all services
docker compose -f docker-compose.prod.yml up -d

# 7. Verify
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs api --tail=50
```

### Ongoing Deploys (after code changes)
```bash
git pull origin main
docker compose -f docker-compose.prod.yml build api web
docker compose -f docker-compose.prod.yml up -d --no-deps api web
```

---

## Pre-Launch Audit Checklist

**Security**
- [ ] All `.env` secrets are real production values (no test keys)
- [ ] Stripe webhook secret is set correctly
- [ ] VAPID keys are in production env
- [ ] All admin accounts have strong passwords
- [ ] Rate limiting is active on auth endpoints (Cloudflare WAF)
- [ ] Security headers are present (`X-Frame-Options`, `CSP`, etc.)
- [ ] `synchronize: false` in TypeORM config (never auto-sync in production)

**Data**
- [ ] All TypeORM migrations have run (`typeorm migration:run` success)
- [ ] Database seeded: permissions, 4 roles, 1 admin user
- [ ] `app_settings` has all required keys with sensible defaults
- [ ] At least 3 payment gateways seeded (inactive — admin enables at launch)
- [ ] At least 1 email template per key seeded

**SEO / Indexing**
- [ ] `robots.txt` is live at `https://nooremoon.global/robots.txt`
- [ ] Sitemap is live at `https://nooremoon.global/sitemap.xml`
- [ ] Submit sitemap to Google Search Console
- [ ] Google Analytics or equivalent tracking is active (tag from `app_settings`)

**Monitoring**
- [ ] Set up uptime monitoring (e.g. UptimeRobot free tier — alert on /api/health down)
- [ ] NestJS `/health` endpoint returns 200 and checks DB + Redis connectivity
- [ ] Docker container restart policy: `unless-stopped`
- [ ] Daily database backup configured (pg_dump to external storage)

**Final**
- [ ] All P1 issues resolved (see list above)
- [ ] All E2E test flows passed manually on staging
- [ ] Cloudflare proxy is active (orange cloud icon in DNS)
- [ ] Cloudflare SSL mode: Full (Strict)
- [ ] Stripe in Live mode (not Test mode)
- [ ] Admin creates at least one real product before launch
- [ ] Admin enables at least one payment gateway
