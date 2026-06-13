# Sprint 15 — SEO & Performance
**Workflow file for Claude Code**

## Goal
Get Core Web Vitals green, implement complete SEO (meta tags, structured data, sitemap, robots.txt), and configure Cloudflare caching rules. Target: Lighthouse score ≥ 90 on all metrics.

## Prerequisites
- All product, PLP, PDP, CMS pages built (Sprints 3–12)
- Cloudflare DNS active (from Sprint 0)
- PWA complete (Sprint 14)

---

## Next.js Metadata (per-page)

Every page must export `generateMetadata()` with:
- `title`: `"Product Name | NOOREMOON"` (not just `"NOOREMOON"`)
- `description`: 150–160 chars, unique per page
- `openGraph.images`: 1200×630 image
- `canonical`: absolute URL of the page
- `robots`: index/follow (or noindex for admin/profile/cart pages)

### Implementation Pattern
```typescript
// apps/web/app/products/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.slug); // server-side API call
  return {
    title: `${product.meta_title || product.name} | NOOREMOON`,
    description: product.meta_description || product.description.substring(0, 155),
    openGraph: {
      title: product.name,
      description: product.meta_description,
      images: [{ url: product.cover_image_url, width: 1200, height: 630 }],
      type: 'website',
    },
    alternates: { canonical: `https://nooremoon.global/products/${product.slug}` },
  };
}
```

### Pages that must have custom metadata
- Homepage: brand tagline, og:image = hero banner
- PLP (category): `{CategoryName} Collection | NOOREMOON`
- PLP (sub-category): `{SubCategoryName} – {CategoryName} | NOOREMOON`
- PDP: product name + description from DB
- Season page: season name + tagline
- CMS pages: meta from `cms_pages` table
- Search results: `noindex` (duplicate content risk)
- Profile / Cart / Checkout: `noindex`
- Admin: `noindex, nofollow`

---

## Structured Data (JSON-LD)

### Product (PDP)
```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  image: product.images.map(i => i.url),
  description: product.description,
  brand: { '@type': 'Brand', name: 'NOOREMOON' },
  offers: {
    '@type': 'Offer',
    priceCurrency: 'GBP',
    price: (product.final_price_cents / 100).toFixed(2),
    availability: product.total_stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    url: `https://nooremoon.global/products/${product.slug}`,
  },
};
```

### BreadcrumbList (PLP + PDP)
```typescript
{
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nooremoon.global' },
    { '@type': 'ListItem', position: 2, name: category.name, item: `https://nooremoon.global/c/${category.slug}` },
    { '@type': 'ListItem', position: 3, name: product.name },
  ],
}
```

### Organization (layout root)
```typescript
{
  '@type': 'Organization',
  name: 'NOOREMOON',
  url: 'https://nooremoon.global',
  logo: 'https://nooremoon.global/icons/icon-512.png',
  sameAs: [instagramUrl, facebookUrl], // from app_settings
  contactPoint: { '@type': 'ContactPoint', email: supportEmail, contactType: 'customer service' }
}
```

Inject all JSON-LD as `<script type="application/ld+json">` in the page `<head>` using Next.js Script component or inline in page component.

---

## Sitemap

`apps/web/app/sitemap.ts` (Next.js built-in sitemap support):
```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, subCategories, seasons, cmsPages] = await Promise.all([
    getAllProducts(),        // GET /sitemap/products
    getAllCategories(),      // GET /sitemap/categories
    getAllSubCategories(),
    getAllSeasons(),
    getAllCmsPages(),
  ]);

  return [
    { url: 'https://nooremoon.global', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...products.map(p => ({ url: `https://nooremoon.global/products/${p.slug}`, lastModified: p.updated_at, changeFrequency: 'weekly', priority: 0.8 })),
    ...categories.map(c => ({ url: `https://nooremoon.global/c/${c.slug}`, changeFrequency: 'weekly', priority: 0.7 })),
    ...seasons.filter(s => !s.is_archived).map(s => ({ url: `https://nooremoon.global/season/${s.slug}`, changeFrequency: 'daily', priority: 0.9 })),
    ...cmsPages.filter(p => p.status === 'PUBLISHED').map(p => ({ url: `https://nooremoon.global/${p.slug}`, changeFrequency: 'monthly', priority: 0.5 })),
  ];
}
```

Add backend endpoints for sitemap data:
```
GET /sitemap/products       -- id, slug, updated_at (no auth, minimal fields)
GET /sitemap/categories     -- id, slug
GET /sitemap/sub-categories -- id, slug
GET /sitemap/seasons        -- id, slug, is_archived
```

### `robots.txt`
`apps/web/app/robots.ts`:
```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/profile', '/checkout', '/cart', '/api/'] }
    ],
    sitemap: 'https://nooremoon.global/sitemap.xml',
  };
}
```

---

## Image Optimisation

All images served through Next.js `<Image>` component:
```typescript
<Image
  src={product.cover_image_url}
  alt={product.name}
  width={600}
  height={800}
  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
  priority={isAboveFold}   // only for LCP image
  placeholder="blur"
  blurDataURL={product.blur_placeholder}
/>
```

Rules:
- Every `<img>` must have descriptive `alt` text (not "product-image-1")
- `priority={true}` only on the first above-the-fold image (hero, PDP main image) — not on cards
- All uploaded images: convert to WebP on upload (use `sharp` in the NestJS upload handler)
- Generate blur placeholder on upload (a 10×10 pixel base64 WebP) and store in DB

---

## Core Web Vitals Checklist

### LCP (Largest Contentful Paint) — target: < 2.5s
- Hero image has `priority={true}` and `fetchpriority="high"`
- Hero image is above the fold and correctly sized (no extra-large images for small containers)
- Preconnect to image CDN: `<link rel="preconnect" href="https://nooremoon.global">`
- No render-blocking resources in `<head>` (audit with Lighthouse)

### CLS (Cumulative Layout Shift) — target: < 0.1
- Every `<Image>` has explicit `width` and `height` (prevents layout shift)
- Fonts: use `next/font` with `display: swap` — never `@import` a font in CSS
- No dynamic content injected above existing content without reserved space

### FID / INP (Interaction to Next Paint) — target: < 200ms
- No heavy JS on the main thread during scroll
- Defer non-critical third-party scripts (chat widget, analytics) with `strategy="lazyOnload"`
- Use `React.lazy()` + `Suspense` for admin-only components

---

## Cloudflare Configuration

### Page Rules / Cache Rules
Set up in Cloudflare dashboard (or via Terraform if scripting):

| Pattern | Cache | TTL |
|---------|-------|-----|
| `nooremoon.global/` | Cache Everything | 1 hour |
| `nooremoon.global/products/*` | Cache Everything | 4 hours |
| `nooremoon.global/c/*` | Cache Everything | 2 hours |
| `nooremoon.global/season/*` | Cache Everything | 2 hours |
| `nooremoon.global/api/*` | Bypass | — |
| `nooremoon.global/admin/*` | Bypass | — |
| `nooremoon.global/profile/*` | Bypass | — |
| `nooremoon.global/checkout/*` | Bypass | — |

On product update → admin dashboard calls Cloudflare Cache Purge API:
```typescript
await fetch(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` },
  body: JSON.stringify({ files: [`https://nooremoon.global/products/${slug}`] }),
});
```

### Security Headers
Configure in Cloudflare (or `next.config.js` headers):
```
Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; ...
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Rate Limiting (Cloudflare WAF)
- `/api/auth/login`: max 10 req/min per IP
- `/api/auth/otp`: max 5 req/min per IP
- `/api/payments/*`: max 20 req/min per IP
- General API: max 200 req/min per IP

---

## Breadcrumbs

Add breadcrumbs to PLP and PDP:
```
Home > Collections > Legends Edit > Panjabi
Home > Collections > Legends Edit > Panjabi > Product Name
```

Use `nav aria-label="breadcrumb"` for accessibility. Breadcrumb items are links except the last (current page).

---

## Done When
- [ ] Every product page has unique title, description, og:image
- [ ] PDP has Product JSON-LD structured data
- [ ] PLP, PDP have BreadcrumbList JSON-LD
- [ ] Homepage has Organization JSON-LD
- [ ] Sitemap at `/sitemap.xml` includes all products, categories, seasons, CMS pages
- [ ] `robots.txt` disallows admin/profile/checkout
- [ ] All product images served as WebP
- [ ] All `<Image>` components have explicit width + height (no CLS)
- [ ] LCP image has `priority={true}` (only the hero/main image)
- [ ] Fonts loaded via `next/font` (no flash of unstyled text)
- [ ] Lighthouse score ≥ 90 on Desktop Performance
- [ ] Lighthouse score ≥ 80 on Mobile Performance
- [ ] Cloudflare page rules cache product + PLP pages
- [ ] Cache purge fires when admin updates a product
- [ ] Security headers present on all responses
- [ ] Cloudflare rate limiting active on auth + payment endpoints
