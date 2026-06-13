# Agent: Gateway Integrator

Implements a new payment gateway plugin for the NOOREMOON platform.

## When to Use

When adding a new payment gateway (e.g. PayPal, SSL Commerz, Nagad) to an existing running platform.

## Context This Agent Needs

- Access to `apps/api/src/payments/` directory
- The gateway's official API documentation URL or PDF
- The gateway's test credentials (from admin dashboard `payment_gateways` table)

## What This Agent Does

1. **Reads** the existing gateway implementations to understand the `PaymentGateway` interface:
   - `apps/api/src/payments/gateways/gateway.interface.ts`
   - `apps/api/src/payments/gateways/stripe.gateway.ts` (reference implementation)
   - `apps/api/src/payments/gateway.factory.ts`

2. **Creates** the new gateway file: `apps/api/src/payments/gateways/<name>.gateway.ts`
   - Implements `PaymentGateway` interface exactly
   - `initiatePayment()` — creates payment session with the gateway API
   - `verifyPayment()` — verifies callback payload
   - `handleWebhook()` — verifies webhook signature + processes event

3. **Registers** the new gateway in `GatewayFactory` so it's resolvable by key

4. **Creates** a migration to seed the new gateway row:
   ```sql
   INSERT INTO payment_gateways (key, label, logo_url, is_active)
   VALUES ('<key>', '<Label>', '/logos/<key>.svg', false)
   ON CONFLICT (key) DO NOTHING;
   ```

5. **Tests** the flow:
   - Initiate payment → receive redirect URL or client secret
   - Simulate callback to `POST /payments/callback/<key>`
   - Verify order status updates to PAID

## Rules

- Never change the `PaymentGateway` interface — add to gateway without breaking others
- Gateway credentials are stored in `payment_gateways.config` (jsonb) — never in `.env` directly
- All gateways default to `is_active = false` — admin enables from dashboard
- Webhook signature verification is mandatory — never skip it
- Amount passed to gateway is always server-computed in the correct currency unit for that gateway
