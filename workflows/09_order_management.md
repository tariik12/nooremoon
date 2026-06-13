# Sprint 8 — Order Management & Tracking
**Workflow file for Claude Code**

## Goal
Build order history, real-time status tracking, SMTP email notifications, cancellation window logic, exchange request workflow, and authorised receipt designation. All order statuses and notification templates are dashboard-manageable.

## Prerequisites
- Sprint 7 complete: checkout + order creation working
- RabbitMQ consumers wired up

---

## First: Add Email Templates Table (dashboard-managed)

Admin can edit all transactional email templates from the dashboard:

```sql
CREATE TABLE email_templates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key          varchar(100) UNIQUE NOT NULL,  -- e.g. 'order_placed', 'order_shipped'
  subject      varchar(300) NOT NULL,
  body_html    text NOT NULL,                  -- Handlebars template
  is_active    boolean DEFAULT true,
  updated_by   uuid REFERENCES users(id),
  created_at   timestamp,
  updated_at   timestamp
);
```

Seed keys (admin edits content from dashboard):
```
order_placed, order_confirmed, order_shipped, order_out_for_delivery,
order_delivered, order_cancelled, exchange_requested, exchange_approved,
exchange_rejected, password_reset, verify_email, otp, welcome, low_stock_alert
```

**Endpoint:**
```
GET    /admin/email-templates          -- list all (requires: email.manage)
GET    /admin/email-templates/:key     -- get one
PATCH  /admin/email-templates/:key     -- edit subject + body (Handlebars)
POST   /admin/email-templates/:key/preview  -- send preview to admin email
```

---

## Backend

### `OrdersModule` Endpoints (Customer-facing)
```
GET    /orders                          -- list own orders (paginated)
GET    /orders/:id                      -- get order detail + items + status history
GET    /orders/:id/tracking             -- get tracking info (from courier API or manual)
POST   /orders/:id/cancel               -- cancel order (only if cancellation_window_open = true)
POST   /orders/:id/exchange             -- initiate exchange request
POST   /orders/:id/authorised-recipient -- designate authorised recipient for delivery
GET    /orders/:id/exchange             -- get exchange request status
```

### `OrdersModule` Endpoints (Admin)
```
GET    /admin/orders                    -- list all orders with filters + search
GET    /admin/orders/:id                -- get full order detail
PATCH  /admin/orders/:id/status         -- update order status
POST   /admin/orders/:id/confirm        -- mark Service Centre confirmed (closes cancellation window)
POST   /admin/orders/:id/tracking       -- add tracking number + courier name
GET    /admin/orders/:id/invoice        -- generate PDF invoice
GET    /admin/orders/:id/packing-list   -- generate PDF packing list
GET    /admin/exchange-requests         -- list all exchange requests
PATCH  /admin/exchange-requests/:id     -- approve / reject exchange
```

---

## Cancellation Window Logic

```typescript
// Order is cancellable ONLY while cancellation_window_open = true
// This flag is set to false when admin calls POST /admin/orders/:id/confirm

async cancelOrder(orderId: string, userId: string) {
  const order = await this.ordersRepo.findOne({ where: { id: orderId, user_id: userId } });
  if (!order) throw new NotFoundException();
  if (!order.cancellation_window_open) {
    throw new BadRequestException('Cancellation window has closed. Your order has been confirmed by our Service Centre.');
  }
  // Proceed with cancellation: restore stock, update status, send email
  await this.ordersRepo.update(orderId, { status: OrderStatus.CANCELLED });
  await this.stockService.restoreStock(order);
  await this.emailService.sendFromTemplate('order_cancelled', order.user.email, { order });
  await this.notificationService.emitToAdmin(NotificationEvent.ORDER_CANCELLED, { orderId });
}
```

**Frontend:** In `/profile` Order History, show "Cancel Order" button ONLY when `order.cancellation_window_open === true`. Button disappears after Service Centre confirmation.

---

## Exchange Request Workflow

Business rules enforced server-side:
1. Check order delivered status
2. Check delivery date ≤ 7 days ago (7-day window from `order.updated_at` when status = DELIVERED)
3. Check item is not a Flash Sale item (`order_item.is_flash_sale_item`)
4. Check item discount at order time < 50% (`order_item.discount_percent_at_order < 50`)
5. Check no previous exchange exists for this order item

```typescript
async requestExchange(orderId, orderItemId, userId, dto) {
  // Run all 5 eligibility checks — throw 422 with specific reason if any fail
  // Create exchange_requests row with status REQUESTED
  // Emit socket.io new_exchange_request to /admin namespace
  // Send email to customer using 'exchange_requested' template
  // Send notification email to support team
}
```

Exchange request includes unboxing video URL (customer uploads video first via `POST /uploads/video`, gets back a URL, then submits with exchange request).

---

## Email Notification Consumers (RabbitMQ)

Create a RabbitMQ consumer for each order event. Each consumer:
1. Loads the email template from DB (or Redis cache, 5min TTL)
2. Renders the Handlebars template with order data
3. Sends via SMTP (Nodemailer)
4. Logs the send in a `email_logs` table

```
order.placed      → send 'order_placed' email
order.confirmed   → send 'order_confirmed' email
order.shipped     → send 'order_shipped' email (include tracking number)
order.delivered   → send 'order_delivered' email
order.cancelled   → send 'order_cancelled' email
exchange.requested → send 'exchange_requested' email to customer + support notification
exchange.approved  → send 'exchange_approved' email
exchange.rejected  → send 'exchange_rejected' email
```

---

## Socket.IO — Admin Real-Time Notifications

Every order event emits to the `/admin` Socket.IO namespace:
```typescript
// apps/api/src/notifications/notifications.gateway.ts
// Namespace: /admin
// Events:
//   new_order           { orderId, orderNumber, total, customerName }
//   order_status_change { orderId, oldStatus, newStatus }
//   new_exchange_request { requestId, orderId, customerName }
//   order_cancelled     { orderId, orderNumber }
```

Admin dashboard shows a notification bell that pops up on these events in real-time.

---

## Tracking

- Tracking number and courier name stored on the order (`tracking_number`, `courier_name`)
- Admin adds tracking info via `POST /admin/orders/:id/tracking`
- Customer views at `GET /orders/:id/tracking`
- If a courier API is integrated later (Sprint 16), it can replace the manual tracking flow — the endpoint contract stays the same

---

## PDF Generation (Invoice + Packing List)

Use `pdfmake` or `puppeteer` to generate PDFs server-side.

Invoice includes: order number, date, customer details, items + prices, totals, NOOREMOON branding.
Packing list includes: order number, items, sizes, quantities, destination address.

Endpoints stream the PDF directly:
```
GET /admin/orders/:id/invoice      → Content-Type: application/pdf
GET /admin/orders/:id/packing-list → Content-Type: application/pdf
```

---

## Frontend — `/profile` Order History

**Tabs:** Orders | Exchanges | Wishlist | Loyalty | Profile Settings

**Orders tab:**
- List: Order ID, date, status badge (colour-coded), total, "View" button
- Status badges: each OrderStatus maps to a colour (configurable in app_settings)
- "Cancel Order" button shown only when `cancellation_window_open = true`
- "Request Exchange" button shown only when eligible (delivered + within 7 days)

**Order Detail page `/profile/orders/:id`:**
- Order items with images
- Shipping address
- Payment method
- Status timeline (from `order_status_history`)
- Tracking number + courier (when added by admin)
- Cancel / Exchange CTAs (gated by business rules)

**Exchange request form:**
- Select which item to exchange
- Reason (text)
- Upload unboxing video (required if claiming damaged/missing)
- Select desired replacement variant

---

## Done When
- [ ] Order history at `/profile` lists all customer orders with status
- [ ] Order detail page shows full order + status timeline
- [ ] "Cancel Order" button appears/disappears based on `cancellation_window_open`
- [ ] Admin can mark an order as Service Centre confirmed → closes cancellation window
- [ ] Exchange request validates all 5 business rules server-side
- [ ] Exchange request rejected with specific reason when ineligible
- [ ] All 8 transactional email types send correctly via SMTP using DB templates
- [ ] Admin can edit email templates from dashboard without code change
- [ ] Socket.IO emits admin notifications for new orders and exchange requests
- [ ] Admin can add tracking number → customer sees it in order detail
- [ ] Admin can generate PDF invoice and packing list
