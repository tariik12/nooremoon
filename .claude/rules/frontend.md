# Rule: Next.js 16 Frontend Conventions

## Package Manager
**pnpm only** — never npm or yarn.

## App Router Structure

```
apps/web/app/
  layout.tsx                    — root layout (fonts, providers, header, footer)
  page.tsx                      — homepage
  (site)/                       — route group for public pages (shares layout)
    products/[slug]/page.tsx    — PDP
    c/[slug]/page.tsx           — category PLP
    s/[slug]/page.tsx           — sub-category PLP
    season/[slug]/page.tsx      — seasonal collection
    search/page.tsx             — search results
    shopping-bag/page.tsx       — cart
    checkout/page.tsx           — checkout (no-index)
    profile/
      page.tsx                  — order history
      orders/[id]/page.tsx      — order detail
  (auth)/                       — route group for auth pages (no header/footer)
    login/page.tsx
    register/page.tsx
  admin/                        — admin dashboard (protected)
    layout.tsx                  — admin layout (sidebar nav)
    page.tsx                    — dashboard
    products/page.tsx
    orders/page.tsx
    ...
  api/
    revalidate/route.ts         — cache revalidation webhook
```

## Server vs Client Components

Default: Server Component. Add `'use client'` only when needed:
- Uses `useState`, `useEffect`, `useRef`
- Uses browser APIs (`localStorage`, `navigator`, `window`)
- Uses event handlers (`onClick`, `onChange`)
- Uses Redux store (`useSelector`, `useDispatch`)

Data fetching happens in Server Components (async component or `generateMetadata`). Pass data down as props to Client Components — never fetch in client components unless it's user-triggered (e.g. search suggestions, cart updates).

## Data Fetching Patterns

```typescript
// Server Component — static with ISR (product pages)
export const revalidate = 3600; // 1 hour

async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await fetch(`${process.env.API_URL}/products/${params.slug}`, {
    next: { revalidate: 3600 }
  }).then(r => r.json());
  return <ProductDetail product={product} />;
}

// Server Component — always fresh (admin pages, profile)
async function OrdersPage() {
  const orders = await fetch(`${process.env.API_URL}/admin/orders`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${await getServerToken()}` }
  }).then(r => r.json());
  return <OrderList orders={orders} />;
}
```

## Image Component Rules

Always use `next/image`. Every `<Image>` must have:
- Explicit `width` and `height` (prevents CLS)
- Descriptive `alt` text (not "product-image-1")
- `priority={true}` only on the first above-the-fold image
- `sizes` prop for responsive images

```typescript
<Image
  src={product.coverImageUrl}
  alt={`${product.name} – ${product.tierName}`}
  width={600}
  height={800}
  sizes="(max-width: 768px) 50vw, 25vw"
  priority={isAboveFold}
/>
```

## No Hardcoded Content

Never write text content inline in JSX. All visible text that could change per client or per business decision must come from:
- API (`/settings/public`, `/cms/pages/:slug`)
- Translation keys (if i18n added later)

Exception: UI labels that are truly universal (e.g. "Add to Bag", "Checkout") — but even these should use a `t()` function so they can be translated later.

## Redux Toolkit

Store lives at `apps/web/store/`. Slices:
```
store/
  index.ts           — configureStore
  cartSlice.ts       — cart items, session ID, summary
  authSlice.ts       — user, tokens
  uiSlice.ts         — modals, drawer state, notification toast
  wishlistSlice.ts   — wishlist product IDs
```

Never put server-fetched data in Redux (use React Server Components or TanStack Query for that). Redux is for client-side state only: cart, auth tokens, UI state.

## Tailwind CSS

- Mobile-first: base styles are mobile, then `md:` and `lg:` for larger screens
- Design tokens (colours, fonts) defined in `tailwind.config.ts` — never hardcode hex values in className
- Never use arbitrary values (`w-[347px]`) unless absolutely necessary and documented
- Component classes extracted with `@apply` only in `globals.css` for truly reusable patterns

## Metadata & SEO

Every page must export `generateMetadata()`. See `.claude/rules/api-design.md` for SEO rules. No `<title>` or `<meta>` tags in JSX — always use the metadata API.

## Environment Variables

Frontend env vars:
- `NEXT_PUBLIC_*` — safe to expose to browser
- Non-prefixed — server-only (never in client components)

```
NEXT_PUBLIC_API_URL=https://api.nooremoon.global
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
API_URL=http://api:3001          # internal, server-side only
NEXTAUTH_SECRET=...              # server-side only
```
