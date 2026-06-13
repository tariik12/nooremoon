# Sprint 9 — Loyalty Programme & Gift Cards
**Workflow file for Claude Code**

## Goal
Build the tiered loyalty points system and gift card purchase/redemption. Both are fully dashboard-managed: tier names, thresholds, and multipliers live in the DB — nothing hardcoded.

## Prerequisites
- Sprint 8 complete: orders created + RabbitMQ `order.placed` event working
- Sprint 2 complete: auth working

---

## Loyalty System Architecture

### Tables (already in Sprint 1 schema)
```
loyalty_tiers         -- tier definitions (name, points_threshold, perks, multiplier)
loyalty_accounts      -- one per user (current_points, lifetime_points, current_tier_id)
loyalty_transactions  -- audit trail of every point earn/redeem/expire
```

All tier names, thresholds, and multipliers are defined in the `loyalty_tiers` table. Admin manages from dashboard.

### Initial Seed (admin can change from dashboard)
```
Tier 1: Bronze     — 0 pts threshold,    1.0× multiplier
Tier 2: Silver     — 500 pts threshold,  1.25× multiplier
Tier 3: Gold       — 1500 pts threshold, 1.5× multiplier
Tier 4: Platinum   — 3000 pts threshold, 2.0× multiplier
```

Points earn rate and redemption rate stored in `app_settings`:
```
loyalty_points_per_dollar      = '10'    -- 10 pts per $1 spent
loyalty_redemption_rate_cents  = '100'   -- 100 pts = $1 off
loyalty_points_expiry_days     = '365'   -- 365 days from earn date
```

---

## Backend

### `LoyaltyModule` Endpoints (Customer-facing)
```
GET    /loyalty                         -- get own loyalty account + tier + balance
GET    /loyalty/tiers                   -- list all tiers (public, Redis cached 10min)
GET    /loyalty/transactions            -- get own points history (paginated)
POST   /loyalty/redeem                  -- redeem points at checkout (validate + apply discount)
```

### `LoyaltyModule` Endpoints (Admin)
```
GET    /admin/loyalty/tiers             -- list all tiers
POST   /admin/loyalty/tiers             -- create tier
PATCH  /admin/loyalty/tiers/:id         -- update tier (name, threshold, multiplier, perks)
DELETE /admin/loyalty/tiers/:id         -- delete tier (only if no users on it)
POST   /admin/loyalty/adjust            -- manually adjust a user's points (with reason)
GET    /admin/loyalty/accounts          -- list all customer loyalty accounts
```

### Points Earning (RabbitMQ Consumer)
Triggered by `order.placed` event:

```typescript
async onOrderPlaced(order: Order) {
  const settings = await this.settingsService.getPublicSettings();
  const pointsPerDollar = settings.loyalty_points_per_dollar;

  const account = await this.loyaltyRepo.findOne({ where: { user_id: order.user_id } });
  const tier = await this.tiersRepo.findOne({ where: { id: account.current_tier_id } });

  const basePoints = Math.floor((order.subtotal_cents / 100) * pointsPerDollar);
  const bonusPoints = Math.floor(basePoints * (tier.multiplier - 1));
  const totalPoints = basePoints + bonusPoints;

  await this.addPoints(account.id, totalPoints, `Order #${order.order_number}`, order.id);
  await this.checkAndUpgradeTier(account);
}
```

Tier upgrade logic: after every point earn, check if `lifetime_points` crosses next tier's `points_threshold` → if yes, upgrade `current_tier_id`.

### Points Expiry Job
Scheduled job (cron) runs daily at 2am. Reads `loyalty_points_expiry_days` from `app_settings`:
- Finds all `loyalty_transactions` of type `EARN` that are older than expiry window
- Creates corresponding `EXPIRE` transactions
- Deducts from `loyalty_accounts.current_points`
- Sends expiry warning email 30 days before expiry

### Points Redemption at Checkout
```
POST /loyalty/redeem
Body: { points_to_redeem: 500 }
```
- Validate user has enough points
- Calculate discount: `floor(points_to_redeem / 100) * settings.loyalty_redemption_rate_cents`
- Store discount on pending order
- Do NOT deduct points yet — deduct only after payment confirmed
- On payment confirmed: deduct from account + create `REDEEM` transaction

---

## Gift Cards

### Tables (already in Sprint 1 schema)
```
gift_card_templates    -- denominations: 25, 50, 100, 250 (managed from dashboard)
gift_cards             -- individual codes: code, balance_cents, expires_at, purchased_by
gift_card_redemptions  -- which order used which gift card (partial redemptions allowed)
```

Admin manages denominations and designs from dashboard.

### `GiftCardsModule` Endpoints (Customer-facing)
```
GET    /gift-cards/templates             -- list purchasable denominations + designs (public)
POST   /gift-cards/purchase             -- buy a gift card (creates order + charges payment)
GET    /gift-cards/balance?code=XXX     -- check gift card balance (public, no auth)
POST   /gift-cards/apply                -- apply gift card to cart (validates + stores on session)
```

### `GiftCardsModule` Endpoints (Admin)
```
GET    /admin/gift-cards/templates       -- list templates
POST   /admin/gift-cards/templates       -- add denomination
PATCH  /admin/gift-cards/templates/:id   -- toggle active, update design
GET    /admin/gift-cards                 -- list all issued gift cards + balances
POST   /admin/gift-cards/issue           -- manually issue a gift card (refund, compensation)
```

### Gift Card Purchase Flow
1. Customer selects denomination from `/gift-cards` page
2. Enters recipient email + personalised message
3. Completes normal checkout flow (Stripe/bKash/EPS)
4. After payment confirmed → system generates unique 16-char code → saves to `gift_cards`
5. Email sent to recipient with code (using `gift_card_purchase` email template)
6. Gift card appears in purchaser's profile under "Gift Cards Sent"

### Gift Card Code Generation
```typescript
function generateGiftCardCode(): string {
  // Format: XXXX-XXXX-XXXX-XXXX (alphanumeric, uppercase, no confusable chars)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return [0,4,8,12].map(i => Array.from({length:4}, () => chars[Math.floor(Math.random()*chars.length)]).join('')).join('-');
}
```

### Gift Card Redemption at Checkout
- Customer enters code in `/shopping-bag` → calls `POST /cart/validate-gift-card`
- System validates code exists, not expired, has balance
- Shows available balance: "£XX.XX gift card credit will be applied"
- At checkout payment step: deduct gift card from total first, then charge remainder to payment gateway
- If gift card covers full order: no gateway charge, order placed as "paid by gift card"
- Partial: gift card deducted, remainder charged
- After payment: create `gift_card_redemptions` row + update `gift_cards.balance_cents`

---

## Frontend

### Loyalty Page `/loyalty`
- Dashboard showing current tier with badge
- Points balance (current + lifetime)
- Progress bar to next tier
- Points history table (type, amount, date, order reference)
- "How it works" section explaining earn rates + tiers (content from CMS)

### Gift Cards Page `/gift-cards`
- Grid of available denominations (cards with design preview)
- Select denomination → recipient form (email, name, message, optional delivery date)
- Preview of the gift card email the recipient will receive
- Checkout flow (uses same checkout as product orders)

### Profile Page — Loyalty & Gift Cards Tabs
- Loyalty tab: same content as `/loyalty`
- Gift Cards tab: list of gift cards purchased (code, value, remaining balance, recipient)

---

## Done When
- [ ] Loyalty tiers are DB-driven — admin can add/edit tiers from dashboard
- [ ] Points earn rate and redemption rate configurable from app_settings
- [ ] Points awarded correctly after order completion via RabbitMQ consumer
- [ ] Tier upgrade happens automatically when lifetime points cross threshold
- [ ] Tier multipliers apply correctly (Gold earns 1.5× base points)
- [ ] Points redeemable at checkout with correct discount calculation
- [ ] Points deducted only after payment confirmed (not on checkout init)
- [ ] Points expiry job runs daily and warns users 30 days before expiry
- [ ] Admin can manually adjust points with reason
- [ ] Gift card denominations managed from admin dashboard
- [ ] Gift card purchase creates unique code + sends to recipient via email
- [ ] Gift card balance check works without login
- [ ] Gift card partial redemption works (remainder charged to gateway)
- [ ] `/loyalty` page renders correct tier + balance + history
- [ ] `/gift-cards` page renders available denominations + purchase flow
