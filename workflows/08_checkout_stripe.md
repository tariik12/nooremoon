# Sprint 7 — Checkout & Payment
**Workflow file for Claude Code**

## Goal
Build the 5-step checkout flow with a **dynamic, dashboard-managed payment gateway system**. Payment methods (Stripe, bKash, EPS, and any future gateway) are enabled/disabled and configured from the admin dashboard — the platform is designed to be re-sold to other businesses.

## Prerequisites
- Sprint 6 complete: cart + app_settings working
- Sprint 2 complete: auth working

---

## First: Add Payment Gateways Table (new migration)

```sql
CREATE TABLE payment_gateways (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key          varchar(100) UNIQUE NOT NULL,   -- e.g. 'stripe', 'bkash', 'eps', 'paypal'
  label        varchar(200) NOT NULL,           -- shown to customers e.g. 'Credit/Debit Card'
  description  varchar(500),                    -- e.g. 'Pay securely with Stripe (Visa, Mastercard)'
  logo_url     varchar(500),                    -- gateway logo for payment step UI
  is_active    boolean DEFAULT false,
  sort_order   integer DEFAULT 0,
  config       jsonb,                           -- encrypted gateway credentials/keys
  created_at   timestamp,
  updated_at   timestamp
);
```

Seed initial gateways (all `is_active = false` by default — admin enables from dashboard):
```
key: 'stripe',  label: 'Credit / Debit Card',      logo_url: '/logos/stripe.svg'
key: 'bkash',   label: 'bKash',                     logo_url: '/logos/bkash.svg'
key: 'eps',     label: 'Bangladesh Bank (EPS)',      logo_url: '/logos/eps.svg'
```

Admin can:
- Enable/disable any gateway with a toggle
- Upload a gateway logo
- Set sort order (which appears first)
- Add entirely new gateways (the system architecture supports any gateway)

**Endpoint:**
```
GET    /payment-gateways/active        -- list active gateways (public, Redis cached 5min)
GET    /admin/payment-gateways         -- list all (requires: payments.manage)
POST   /admin/payment-gateways         -- add new gateway
PATCH  /admin/payment-gateways/:id     -- edit / toggle active / update config
```

On any change → invalidate `payment_gateways:active` Redis cache.

---

## Checkout Flow (5 Steps)

```
Step 1: Address Entry
Step 2: Shipping Confirmation
Step 3: Payment (gateways loaded dynamically from API)
Step 4: Order Review
Step 5: Confirmation
```

---

## Backend

### `CheckoutModule` Endpoints
```
POST /checkout/init               -- validate cart, reserve stock, create pending order
POST /checkout/address            -- save/select shipping address
POST /checkout/payment/initiate   -- route to correct gateway based on gateway key
POST /checkout/payment/confirm    -- confirm order after payment callback
GET  /checkout/order/:id          -- get order confirmation

POST /payments/callback/:gateway  -- unified callback handler (Stripe webhook, bKash, EPS, etc.)
```

### Gateway Handler Pattern
Build a gateway plugin system so new gateways can be added without changing core checkout logic:

```typescript
// apps/api/src/payments/gateways/gateway.interface.ts
export interface PaymentGateway {
  key: string;
  initiatePayment(order: Order, amount: number): Promise<PaymentInitResult>;
  verifyPayment(payload: any): Promise<PaymentVerifyResult>;
  handleWebhook?(payload: any, signature: string): Promise<void>;
}

// Implement for each gateway:
// apps/api/src/payments/gateways/stripe.gateway.ts
// apps/api/src/payments/gateways/bkash.gateway.ts
// apps/api/src/payments/gateways/eps.gateway.ts

// GatewayFactory resolves the correct implementation by key:
// const gateway = gatewayFactory.getGateway(order.payment_method);
```

Gateway config (API keys, secrets) is stored in `payment_gateways.config` (jsonb).

### Unified Callback Handler
```typescript
// POST /payments/callback/:gateway  (e.g. /payments/callback/stripe)
// Reads gateway key from URL → routes to correct gateway.verifyPayment()
// On success: update order status → publish to RabbitMQ
```

### Order Creation
- `POST /checkout/init`: create order in `PENDING` status
- Deduct stock from `product_variants.stock_qty` atomically (PostgreSQL transaction)
- Return 409 if any item is out of stock

### Customs Disclaimer
Required by SRS — must appear before payment. Served from `app_settings`:
```
key: 'customs_disclaimer_text'
value: 'Customs and import taxes are the sole responsibility of the customer. NOOREMOON bears no liability.'
```
Admin can update this text from the dashboard at any time.

### Post-Payment (RabbitMQ)
After successful payment, publish `order.placed` event:
- Consumer 1: Send order confirmation email (SMTP)
- Consumer 2: Award loyalty points
- Consumer 3: Emit Socket.IO `new_order` to `/admin` namespace

---

## Frontend

### Step 3 — Payment (fully dynamic)
```typescript
// Fetch active gateways from API on step 3 mount:
// GET /payment-gateways/active
// Returns: [{ key: 'stripe', label: 'Credit/Debit Card', logo_url: '...', sort_order: 1 }, ...]

// Render one tab/card per active gateway
// Gateway-specific UI loaded by key:
//   'stripe'  → render Stripe Elements (CardElement from @stripe/react-stripe-js)
//   'bkash'   → render bKash button (redirects to bKash URL)
//   'eps'     → render EPS button (redirects to EPS URL)
//   unknown   → render a generic "Redirect to pay" button
```

If a new gateway is added from the dashboard, the frontend automatically shows it — no code change needed.

### Customs Disclaimer
Fetched from `GET /settings/public` → rendered in a highlighted box in Step 2 and Step 4.

---

## Security Requirements
- Stripe: verify webhook signature with `STRIPE_WEBHOOK_SECRET` before processing
- bKash + EPS: verify callback signatures using their respective mechanisms
- All payment amounts computed server-side — never trust client total
- Gateway credentials stored in `payment_gateways.config` — encrypt at rest (use AES-256 or Vault)

---

## Done When
- [ ] `payment_gateways` table created with 3 seeded gateways (all inactive by default)
- [ ] Admin can enable/disable gateways from dashboard
- [ ] `GET /payment-gateways/active` returns only active gateways (Redis cached)
- [ ] Frontend payment step renders tabs/cards based on active gateways dynamically
- [ ] Stripe payment flow: PaymentIntent → Stripe Elements → webhook → order confirmed
- [ ] bKash flow: initiate → redirect → callback → order confirmed
- [ ] EPS flow: initiate → redirect → callback → order confirmed
- [ ] Gift card deducted from total before charging any gateway
- [ ] Customs disclaimer text loaded from `app_settings` (dashboard-configurable)
- [ ] Stock deducted atomically on order creation
- [ ] RabbitMQ `order.placed` event triggers email + loyalty + admin notification
- [ ] Order confirmation page shows order number
