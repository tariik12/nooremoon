# Sprint 10 — Admin Dashboard
**Workflow file for Claude Code**

## Goal
Build the full admin dashboard: product management, order management, CMS, promotions (including Flash Sales), site settings, user management, and reporting. All business rules — roles, permissions, payment gateways, shipping rates, email templates, nav structure — are managed from here. Socket.IO notifications and internal messaging are also part of this sprint.

## Prerequisites
- Sprint 1 complete: database schema including `permissions`, `roles`, `role_permissions`
- Sprint 2 complete: auth + dynamic PermissionGuard working
- Sprint 3 complete: products API working
- Sprint 8 complete: orders API working

---

## Admin App Structure

Admin dashboard lives at `apps/web/app/admin/` (Next.js App Router). Route protection: all `/admin` routes check for JWT + `admin.access` permission. If lacking permission, redirect to `/login`.

```
/admin                          → Dashboard (KPIs + live feed)
/admin/products                 → Product list + CRUD
/admin/products/new             → Create product
/admin/products/:id/edit        → Edit product
/admin/categories               → Categories + sub-categories + tiers
/admin/orders                   → Order list + management
/admin/orders/:id               → Order detail + status update
/admin/exchange-requests        → Exchange request queue
/admin/customers                → Customer list + detail + loyalty
/admin/promotions               → Promotions + Flash Sales + discount codes
/admin/seasons                  → Seasonal collections management
/admin/banners                  → Homepage + PLP banners
/admin/navigation               → Mega-menu builder
/admin/cms                      → CMS pages (policies, about, size guide, etc.)
/admin/email-templates          → Transactional email template editor
/admin/payment-gateways         → Enable/disable + configure gateways
/admin/settings                 → App settings (shipping, thresholds, etc.)
/admin/roles                    → Role management
/admin/permissions              → Route permission assignment
/admin/loyalty/tiers            → Loyalty tier editor
/admin/gift-cards               → Gift card management
/admin/store-locations          → Store locations CRUD
/admin/reports                  → Sales, products, customers
/admin/notifications            → Notification inbox
/admin/messages                 → Internal messaging / customer support chat
```

---

## Dashboard Homepage `/admin`

KPI cards (live, from API):
- Total revenue today / this week / this month
- Orders today / pending orders count
- Low stock items count (link to filter)
- New customers today

Activity feed (real-time via Socket.IO `/admin` namespace):
- New order received (order number, customer, total)
- Order cancelled
- New exchange request
- Low stock alert

Charts (server-rendered on load, refreshed every 5 min):
- Revenue over time (last 30 days)
- Orders by status (pie)
- Top-selling products (bar)

---

## Product Management

### Product List `/admin/products`
- Table: image, name, category / sub-category / tier, price, stock, status (active/inactive)
- Filters: category, sub-category, tier, stock status, active/inactive
- Bulk actions: activate, deactivate, delete, export CSV
- Search by name or SKU
- Sort: name, price, stock, date created

### Product Create / Edit
Full form:
- Basic info: name, slug (auto-generated, editable), description (rich text), tier dropdown
- Taxonomy: category → sub-category → tier (cascading selects, all loaded from DB)
- Pricing: original_price, sale_price (optional) → final_price computed
- Images: multi-image upload (drag and drop, reorder, set cover)
- Variants: size × colour matrix — each variant has own SKU + stock_qty
- Flags: is_active, is_featured, is_cottocool, is_flash_sale_eligible
- SEO: meta_title, meta_description, og_image
- Size Guide: select applicable size guide (dropdown from size_guides table)
- Save as draft or publish

### Bulk CSV Import
```
POST /admin/products/import
Body: multipart/form-data (CSV file)
```
CSV columns: name, description, category, sub_category, tier, original_price, sale_price, images (comma-separated URLs), sizes, colours, stock

Validate all rows first — return error report before writing any rows. On success: create all products + variants in a single transaction.

---

## Order Management

### Order List `/admin/orders`
- Columns: order number, customer, date, items, total, status badge, actions
- Filters: status, date range, payment method, gateway
- Search by order number or customer email
- Export to CSV

### Order Detail `/admin/orders/:id`
- Full order info
- Status update dropdown (OrderStatus enum values)
- "Confirm Order" button → sets `cancellation_window_open = false`
- Add tracking: courier name + tracking number
- Notes field (internal, not visible to customer)
- Timeline of all status changes
- Generate Invoice / Packing List PDF buttons
- Refund button (calls gateway refund API)

### Exchange Request Queue `/admin/exchange-requests`
- List: customer, order, item, reason, date submitted
- Detail view: show unboxing video, reason, requested replacement
- Approve / Reject with reason → triggers email to customer

---

## Promotions & Flash Sales

### `PromotionsModule`
```
GET    /admin/promotions             -- list all
POST   /admin/promotions             -- create promotion
PATCH  /admin/promotions/:id         -- update
DELETE /admin/promotions/:id         -- delete

GET    /admin/promotions/flash-sales -- list flash sales
POST   /admin/promotions/flash-sales -- create flash sale
PATCH  /admin/promotions/flash-sales/:id -- edit (including time window)
```

Promotions table columns:
```
id, title, type (FLASH_SALE | DISCOUNT_CODE | AUTO_PERCENT | AUTO_BOGO),
code (for discount codes), discount_percent, discount_amount_cents,
min_order_cents, applies_to (ALL | CATEGORY | PRODUCT),
applies_to_ids (jsonb, array of category or product IDs),
starts_at, ends_at, max_uses, current_uses, is_active
```

### Flash Sale Logic
- Flash sale is a promotion with `type = FLASH_SALE` and a time window (`starts_at`, `ends_at`)
- Flash sale products are flagged at order-item level (`order_item.is_flash_sale_item = true`)
- Flash sale items are not eligible for exchange (enforced in exchange eligibility checks)
- Countdown timer on PDP: read `ends_at` from active flash sale → show live countdown
- Socket.IO emits `flash_sale_started` and `flash_sale_ended` to all connected clients → frontend updates product cards without reload

### Discount Codes
- Customer enters code at checkout → `POST /promotions/validate` returns discount amount
- Tracks usage count, enforces max_uses
- Supports: percentage off, fixed amount off, free shipping

---

## Site Settings `/admin/settings`

All settings from `app_settings` table, grouped and labelled:

**Shipping:**
- Flat rate shipping (pence/cents)
- Free shipping threshold

**Payments:**
- Customs disclaimer text
- Currency code + symbol

**Loyalty:**
- Points per dollar spent
- Redemption rate (points per £1)
- Points expiry days

**General:**
- Order number prefix
- Low stock global threshold
- Store timezone

**Social / Contact:**
- Instagram URL, Facebook URL, TikTok URL, WhatsApp number, Contact email

Admin sees all keys in a form. On save → update `app_settings` table + invalidate all relevant Redis caches.

---

## Role & Permission Management

### `/admin/roles`
- List roles (name, description, user count)
- Create / edit role name + description
- Assign permissions: checkboxes grouped by resource (`orders.view`, `orders.manage`, `products.create`, etc.)
- On save → update `role_permissions` + delete Redis key `role_perms:{roleId}`

### `/admin/permissions`
- Read-only list of all permission keys in the system
- Grouped by resource (orders, products, customers, cms, settings, etc.)
- Description of what each permission grants

All permissions are seeded from code (you must define the complete list in the seed). Admin can only assign existing permissions — they cannot create new permission keys from the dashboard. New permission keys require a developer migration + seed.

---

## Customer Management `/admin/customers`

- List: name, email, join date, total orders, total spent, loyalty tier, status (active/banned)
- Customer detail: profile, order history, loyalty account, loyalty transactions, active gift cards
- Actions: ban/unban, manually adjust loyalty points, send password reset email

---

## Navigation Builder `/admin/navigation`

Visual builder for the mega-menu:
- Add/remove top-level nav items (with label, link, or dropdown)
- Drag-and-drop reorder
- For dropdowns: add column groups with sub-links
- Each item: label, type (link | dropdown | external), href, open in new tab toggle, image (for "featured" column)
- Preview pane shows how it will look
- On save → invalidate `nav:main` Redis cache

All navigation structure lives in `nav_items` table — zero hardcoded nav items in frontend code.

---

## Banner Management `/admin/banners`

- List: image preview, placement (HOMEPAGE_HERO | PLP_TOP | etc.), active status, date range
- Create/edit: upload image, link URL, alt text, placement, show_from, show_until, sort_order, desktop + mobile images separately
- Preview: shows how banner looks at correct aspect ratio

---

## Messaging System `/admin/messages`

Customer support chat using Socket.IO `/chat` namespace.

Admin side:
- Inbox of all open conversations (customer name, last message, unread count)
- Click conversation → open chat thread
- Real-time message receive + send
- Mark resolved / close conversation

Customer side (Sprint 12, in CMS pages):
- Chat widget in bottom-right corner on all pages
- "Chat with us" → opens conversation thread
- Messages persist in `messages` table

---

## Reporting `/admin/reports`

All reports query the database directly (no external analytics at v1):

- **Sales Report:** revenue by day/week/month, avg order value, orders count
- **Product Report:** top 10 by units sold, top 10 by revenue, low-stock items
- **Customer Report:** new customers over time, returning vs new, top spenders
- **Loyalty Report:** points issued, redeemed, expired by period
- **Gift Card Report:** cards issued, total value, redeemed value

All reports: date range filter + export to CSV.

---

## Done When
- [ ] Admin dashboard is accessible only to users with `admin.access` permission
- [ ] Dashboard homepage shows live KPIs and real-time activity feed
- [ ] Product CRUD works (create, edit, toggle active, delete)
- [ ] Bulk CSV import validates then creates products in a transaction
- [ ] Order list + detail with status updates working
- [ ] Admin can confirm order (closes cancellation window)
- [ ] Admin can add tracking info to an order
- [ ] Exchange request queue shows all pending requests, admin can approve/reject
- [ ] Flash Sale creation works with time window and discount percent
- [ ] Flash Sale countdown shown on PDP in real-time
- [ ] Discount codes validate and apply at checkout
- [ ] All app_settings configurable from `/admin/settings`
- [ ] Roles and permissions fully manageable from dashboard (no code changes needed)
- [ ] Navigation mega-menu builder saves to DB and frontend reflects changes
- [ ] Banner management works (upload, placement, date range)
- [ ] Customer support messaging works via Socket.IO
- [ ] All 5 reports generate correct data and export to CSV
