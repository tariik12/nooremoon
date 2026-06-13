# Sprint 4 — Product Listing & Detail Pages
**Workflow file for Claude Code**

## Goal
Build the frontend PLP (Product Listing Page) and PDP (Product Detail Page) in Next.js 16.

## Prerequisites
- Sprint 3 complete: product catalogue API working

---

## Pages to Build

### PLP — `/c/[slug]` (Category) and `/s/[slug]` (Sub-Category / Tier / Season)

**Layout:**
1. Hero banner (fetched from `GET /banners/category/:id` or `GET /banners/season/:id`)
2. Horizontal scrollable tier/filter tabs (only for sub-category pages)
3. Filter sidebar / drawer (mobile: bottom sheet)
4. Product grid
5. Pagination or infinite scroll

**Filter options** (all driven from API, not hardcoded):
- Category (pre-selected based on current route)
- Sub-Category
- Tier (from `GET /tiers`)
- Size (from product variants)
- Colour
- Price Range (slider)
- CottoCool: Yes / No toggle

**Sort options:**
- Newest (default)
- Price: Low to High
- Price: High to Low
- Popularity

**Product Card component:**
```
- Product image (primary) with hover swap to 2nd image
- Product name
- Tier badge (e.g. 'Legends') — dynamic from API
- Price (show original + discounted if discount > 0)
- CottoCool badge (if is_cottocool = true)
- "Out of Stock" overlay if stock_total = 0
- Quick Add / Quick View buttons on hover
```

**"Notify Me" on out-of-stock:**
- Show modal to collect email/phone
- `POST /waitlist` endpoint stores the request
- Admin is notified when admin restocks that variant

**Applied filters:** Show as removable chips above the product grid.

**URL state:** Filters and sort must be reflected in the URL query params so the page is shareable and back-button safe.
```
/s/panjabi-1304?tier=legends&colour=white&price_min=50&price_max=200&sort=newest
```

---

### PDP — `/products/[slug]`

**Layout:**
1. Image gallery (main image + thumbnails), click to zoom / lightbox
2. Product info: name, tier badge, price, CottoCool badge
3. Colour selector (swatches from variants)
4. Size selector (buttons from variants) + Size Guide link
5. Stock status per selected variant
6. "Add to Bag" CTA (disabled until size and colour selected)
7. Delivery info: estimated delivery time, free shipping note (free > $150)
8. Description tabs: Description | Care Instructions
9. Related products carousel (horizontal scroll)

**Size Guide modal / link:**
- Clicking "Size Guide" opens a modal with the size chart for this garment type
- Fetched from `GET /size-guides?garment_type=Panjabi&gender=men`
- Unit toggle: IN / CM

**Add to Bag logic:**
- If no size selected → show inline error "Please select a size"
- If out of stock for selected variant → show "Out of Stock" + "Notify Me"
- On success → update cart count badge in header (via Redux)

---

## Next.js Routing

```
app/
├── (shop)/
│   ├── c/
│   │   └── [slug]/
│   │       └── page.tsx          -- Category PLP
│   ├── s/
│   │   └── [slug]/
│   │       └── page.tsx          -- Sub-category / Season PLP
│   └── products/
│       └── [slug]/
│           └── page.tsx          -- PDP
```

Use **`generateStaticParams`** for categories and sub-categories (SSG) — rebuild on product updates via ISR (revalidate every 60s).

Use **server components** for initial data fetch + **client components** for interactive filters, variant selection, and cart operations.

---

## API Calls from Frontend

```typescript
// PLP
GET /products?category_slug=men&sub_category_slug=panjabi&tier_slug=legends
              &size=M&colour=white&price_min=5000&price_max=20000
              &sort=newest&page=1&limit=24
// Returns: { data: Product[], total, page, limit }

// PDP
GET /products/:slug
// Returns: full product with images, variants, related products

// Size Guide
GET /size-guides?garment_type=Panjabi&gender=men
```

---

## Done When
- [ ] Category PLP (`/c/[slug]`) renders with hero banner + product grid
- [ ] Sub-category PLP (`/s/[slug]`) renders with tier tabs + filtered product grid
- [ ] All filter types work and update the URL query params
- [ ] Product cards show name, tier badge, price, CottoCool badge, out-of-stock state
- [ ] PDP renders: image gallery, colour/size selectors, Add to Bag
- [ ] Add to Bag blocked until size + colour selected
- [ ] Size guide modal opens with correct chart for garment type
- [ ] "Notify Me" modal shown for out-of-stock variants
- [ ] Related products carousel renders at bottom of PDP
- [ ] Cart count badge in header updates after Add to Bag
