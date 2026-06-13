# Sprint 14 — PWA & Mobile Experience
**Workflow file for Claude Code**

## Goal
Turn the Next.js app into a Progressive Web App (PWA): installable on iOS and Android, push notifications, offline shell, and biometric authentication for returning users.

## Prerequisites
- Sprint 2 complete: auth working (WebAuthn stubs already scaffolded)
- Sprint 3–6 complete: core shopping experience working
- Cloudflare SSL active (HTTPS required for PWA + WebAuthn)

---

## Web App Manifest

Create `apps/web/public/manifest.json`:
```json
{
  "name": "NOOREMOON",
  "short_name": "NOOREMOON",
  "description": "Premium fashion. Delivered.",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/home.png", "sizes": "390x844", "type": "image/png", "form_factor": "narrow" }
  ],
  "categories": ["shopping", "lifestyle"]
}
```

Reference in `apps/web/app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'NOOREMOON' },
};
```

Required icons (generate from brand logo):
- `/public/icons/icon-192.png` — 192×192
- `/public/icons/icon-512.png` — 512×512
- `/public/icons/icon-512-maskable.png` — 512×512 with safe zone
- `/public/icons/apple-touch-icon.png` — 180×180

---

## Service Worker

Use `next-pwa` package for service worker setup:

```bash
npm install next-pwa --workspace=apps/web
```

`apps/web/next.config.js`:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.nooremoon\.global\/.*$/,
      handler: 'NetworkFirst',
      options: { cacheName: 'api-cache', expiration: { maxAgeSeconds: 60 } }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif|ico)$/,
      handler: 'CacheFirst',
      options: { cacheName: 'image-cache', expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 } }
    }
  ]
});
module.exports = withPWA({ /* existing next.config */ });
```

Offline shell: if user is offline and visits a cached route, show it from cache. For uncached routes: show a custom offline page (`/offline`) with a "You're offline" message + last-seen products from cache.

---

## Install Prompt

Custom "Add to Home Screen" prompt (instead of browser default):
- Listen for `beforeinstallprompt` event
- Store the event, show a custom bottom sheet banner: "Install NOOREMOON for the best experience → [Install]"
- Dismiss stores `pwa_prompt_dismissed = true` in localStorage (don't show again for 7 days)
- Show prompt only on 3rd+ visit to the site

---

## Push Notifications

### Backend — Web Push Setup
```bash
# Generate VAPID keys (do this once and store in env vars)
npx web-push generate-vapid-keys
```

Add to `.env`:
```
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:support@nooremoon.global
```

Add `push_subscriptions` table:
```sql
CREATE TABLE push_subscriptions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES users(id),
  session_id   varchar(200),
  endpoint     text NOT NULL,
  auth         varchar(500),
  p256dh       varchar(500),
  user_agent   varchar(500),
  created_at   timestamp
);
```

Endpoints:
```
POST /push/subscribe     -- save subscription (auth or guest)
DELETE /push/unsubscribe -- remove subscription
```

### Notification Triggers (sent from NestJS)
| Event | Notification | When |
|-------|-------------|------|
| `order.confirmed` | "Your order #NM1234 is confirmed!" | Admin confirms order |
| `order.shipped` | "Your order is on its way! 📦" | Admin marks shipped |
| `order.out_for_delivery` | "Your order is out for delivery today" | Status update |
| `flash_sale.started` | "Flash Sale is LIVE — 48hrs only!" | Flash sale activates |
| `low_stock` | "Still interested? Only 2 left!" | If wishlisted product hits low stock |

Notifications configurable from admin: admin can send a broadcast push notification from `/admin/notifications/send`.

### Frontend — Permission Request
Ask for push notification permission after:
- User completes their first order (high-intent moment)
- Or on second visit to `/profile`
- NOT on homepage load (too aggressive)

```typescript
async function requestPushPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });
    await api.post('/push/subscribe', subscription);
  }
}
```

---

## Biometric Authentication (WebAuthn)

Already scaffolded in Sprint 2. Complete the implementation here.

### Registration Flow (enroll biometric)
- Shown in `/profile/settings` → "Enable Face ID / Fingerprint"
- Calls `POST /auth/webauthn/register/begin` → gets challenge from server
- Device authenticates → sends credential to `POST /auth/webauthn/register/complete`
- Credential stored in `webauthn_credentials` table

### Login Flow (use biometric)
- On login page: if device has a stored credential → show "Sign in with Face ID / Fingerprint"
- Calls `GET /auth/webauthn/login/begin` with username → gets challenge
- Device authenticates → sends assertion to `POST /auth/webauthn/login/complete`
- Server validates → returns JWT pair same as password login

### Tables
```sql
CREATE TABLE webauthn_credentials (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id),
  credential_id   varchar(500) UNIQUE NOT NULL,
  public_key      text NOT NULL,
  counter         bigint DEFAULT 0,
  device_name     varchar(200),
  last_used_at    timestamp,
  created_at      timestamp
);
```

Use `@simplewebauthn/server` on the NestJS side and `@simplewebauthn/browser` on the Next.js side.

---

## Deep Linking

Configure URL scheme for PWA so that share links open directly in the installed app rather than browser:

In `manifest.json` add:
```json
"scope": "/",
"start_url": "/?source=pwa",
"related_applications": [],
"prefer_related_applications": false
```

Shareable URLs:
- Product: `https://nooremoon.global/products/:slug`
- Season: `https://nooremoon.global/season/:slug`
- These already work in browser; PWA intercepts them when installed

---

## Mobile UX Hardening

- All touch targets ≥ 44×44px (audit with Chrome DevTools)
- Bottom nav bar on mobile (PWA standalone mode):
```
[Home] [Search] [Bag] [Wishlist] [Account]
```
- Swipe gestures: swipe left/right on product image gallery on PDP
- Pull-to-refresh on order history page
- Haptic feedback on Add to Bag (via `navigator.vibrate(50)` if supported)
- No horizontal scroll anywhere (check on 320px viewport)

---

## Done When
- [ ] PWA manifest is valid (test with Chrome DevTools → Application → Manifest)
- [ ] Service worker registers and caches API + image responses
- [ ] App installs to home screen on iOS (Safari → Share → Add to Home Screen)
- [ ] App installs to home screen on Android (Chrome → Install App)
- [ ] Offline page shows correctly when no internet
- [ ] Install prompt shows on 3rd visit, is dismissable, respects 7-day cooldown
- [ ] Push subscription saves correctly for logged-in users
- [ ] Order status push notifications send and display on device
- [ ] Flash sale push notification sends when admin activates a flash sale
- [ ] Biometric registration flow works on a real device
- [ ] Biometric login flow works (existing credential → no password needed)
- [ ] Bottom mobile nav bar renders in PWA standalone mode only
- [ ] All touch targets ≥ 44px (DevTools audit passes)
- [ ] No horizontal scroll at 320px viewport
- [ ] Product image gallery swipe gestures work on touch devices
