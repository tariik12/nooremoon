# Sprint 6 — Shopping Bag
**Workflow file for Claude Code**

## Goal
Build the cart system: guest and authenticated carts, local storage merge on login, `/shopping-bag` page, and the live header badge. All pricing rules (shipping rates, free shipping threshold, etc.) are configurable from the admin dashboard — nothing is hardcoded.

## Prerequisites
- Sprint 2 complete: auth working
- Sprint 3 complete: products + variants in database

---

## First: Add App Settings to the Database

Before building cart logic, add a `app_settings` table (new migration) to store all configurable values:

```sql
CREATE TABLE app_settings (
  key    varchar(100) PRIMARY KEY,   -- e.g. 'shipping_flat_rate_cents'
  value  text,                        -- stored as string, cast on read
  label  varchar(200),               -- shown in admin dashboard
  group  varchar(100),               -- e.g. 'Shipping', 'Payments', 'General'
  updated_at timestamp,
  updated_by uuid REFERENCES users(id)
);
```

Seed these default values (admin can change them from dashboard at any time):
```
shipping_flat_rate_cents       = '2500'    -- $25.00
free_shipping_threshold_cents  = '15000'   -- $150.00
order_number_prefix            = 'NM'
low_stock_global_threshold     = '5'
gift_card_min_spend_cents      = '0'
loyalty_points_expiry_days     = '365'
```

Create `SettingsModule` with:
```
GET    /settings/public          -- public settings (shipping rates, thresholds) — Redis cached 10min
GET    /admin/settings           -- all settings grouped (requires: admin.manage_settings)
PATCH  /admin/settings/:key      -- update a setting value
```

On every settings update → invalidate Redis cache key `settings:public`.

---

## Backend

### `CartModule` Endpoints
```
GET    /cart                    -- get current cart (auth or guest via X-Session-Id header)
POST   /cart/items              -- add item (product_variant_id + quantity)
PATCH  /cart/items/:id          -- update quantity
DELETE /cart/items/:id          -- remove item
DELETE /cart                    -- clear cart
POST   /cart/merge              -- merge guest cart into auth cart (called on login)
GET    /cart/summary            -- subtotal, shipping, total (reads from app_settings)
POST   /cart/validate-gift-card -- validate gift card code, return balance
```

### Cart Summary Logic
All thresholds and rates come from `app_settings` (Redis cached):
```typescript
async getCartSummary(cartId: string) {
  const settings = await this.settingsService.getPublicSettings();
  const subtotal = sum of (item.price_cents_at_add * item.quantity);
  const shipping = subtotal >= settings.free_shipping_threshold_cents
    ? 0
    : settings.shipping_flat_rate_cents;
  const total = subtotal + shipping - gift_card_applied - discount;
  return { subtotal, shipping, total, is_free_shipping: shipping === 0 };
}
```

### Guest Cart Logic
- Guest users send a `X-Session-Id` header (UUID generated client-side, stored in localStorage)
- Cart stored in DB with `user_id = null`, `session_id = <uuid>`
- Guest carts expire after 30 days

### Merge on Login
- After login, frontend calls `POST /cart/merge` with the `session_id`
- Backend moves all guest cart items into the authenticated user's cart
- If same variant in both: sum quantities
- Delete guest cart after merge

### Price Locking
- `price_cents_at_add` = `product.final_price_cents` at the moment of adding
- Locked in the cart — does not update if the product price changes afterwards

### Stock Validation
- On `POST /cart/items`: check `product_variant.stock_qty > 0` — return 409 if out of stock
- On checkout initiation: re-validate all stock quantities

---

## Frontend

### Redux Cart Slice
```typescript
// store/cartSlice.ts
// State: { items: CartItem[], sessionId: string, summary: CartSummary, isLoading: boolean }
// Actions: addItem, removeItem, updateQuantity, mergeCart, clearCart, syncFromServer
```

- On app load: read `sessionId` from localStorage (generate UUID if absent)
- Fetch cart from server on mount using `X-Session-Id` header (guests) or JWT (auth users)
- On login: dispatch `mergeCart` action → call `POST /cart/merge`

### `/shopping-bag` Page

**Layout:**
- Left column (60%): cart items list
- Right column (40%): order summary + checkout CTA

**Cart Item row:**
- Product image, name, tier, size, colour
- Quantity stepper (− qty +)
- Unit price + line total
- Remove button
- "Item sold out" warning if stock changed since adding

**Order Summary:**
- Subtotal
- Shipping: shown as dollar amount fetched from settings (or "FREE" if threshold met)
- Gift card field: input + "Apply" button → calls `POST /cart/validate-gift-card`
- **Total**
- "Proceed to Checkout" CTA

**Empty cart:** illustration + "Your bag is empty" + "Start Shopping" link

### Header Badge
- Count = total quantity (not distinct items)
- Updated via Redux state on every cart mutation
- Optimistic update on Add to Bag from PDP

---

## Done When
- [ ] `app_settings` table created and seeded with default values
- [ ] Admin can view and update any setting from the dashboard
- [ ] Shipping rate and free shipping threshold come from `app_settings` — not hardcoded
- [ ] Guest cart works without login (via X-Session-Id)
- [ ] Guest cart merges into user cart on login
- [ ] `/shopping-bag` shows all items with correct totals
- [ ] Quantity stepper and item removal work
- [ ] Gift card validation works
- [ ] Header badge shows correct count
- [ ] Stock validation blocks adding out-of-stock items
