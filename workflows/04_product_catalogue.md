# Sprint 3 — Product Catalogue
**Workflow file for Claude Code**

## Goal
Build the full product catalogue system: dynamic taxonomy CRUD (categories, sub-categories, tiers), product management with CottoCool flag, inventory per SKU, bulk CSV import/export, and Strapi CMS integration for banners.

## Prerequisites
- Sprint 1 complete: database schema migrated
- Sprint 2 complete: auth + permission guard working

---

## NestJS Modules to Create

### `CategoriesModule`
```
GET    /categories                     -- list all active (public)
GET    /categories/:slug               -- get by slug with sub-categories
POST   /admin/categories               -- create (requires: categories.create)
PATCH  /admin/categories/:id           -- edit (requires: categories.edit)
DELETE /admin/categories/:id           -- soft-deactivate (requires: categories.delete)
PATCH  /admin/categories/reorder       -- drag-drop reorder (requires: categories.edit)
```

### `SubCategoriesModule`
```
GET    /sub-categories                 -- list (optionally filter by category)
GET    /sub-categories/:slug           -- get with tier list
POST   /admin/sub-categories           -- create
PATCH  /admin/sub-categories/:id       -- edit
DELETE /admin/sub-categories/:id       -- deactivate
POST   /admin/sub-categories/:id/tiers -- assign tiers to sub-category
```

### `TiersModule`
```
GET    /tiers                          -- list all active tiers (public)
POST   /admin/tiers                    -- create
PATCH  /admin/tiers/:id               -- edit
DELETE /admin/tiers/:id               -- deactivate
PATCH  /admin/tiers/reorder            -- reorder
```

### `ProductsModule`
```
GET    /products                       -- list with filters + pagination (public)
GET    /products/:slug                 -- get product detail (public)
POST   /admin/products                 -- create product
PATCH  /admin/products/:id             -- edit product
DELETE /admin/products/:id             -- soft-delete
POST   /admin/products/:id/images      -- upload images (multipart)
DELETE /admin/products/:id/images/:imageId  -- remove image
PATCH  /admin/products/:id/images/reorder  -- reorder images
POST   /admin/products/:id/variants    -- add variant (size/colour/SKU)
PATCH  /admin/products/:id/variants/:variantId  -- edit variant
DELETE /admin/products/:id/variants/:variantId  -- delete variant
PATCH  /admin/products/:id/stock       -- update stock qty per variant
POST   /admin/products/import          -- bulk CSV import
GET    /admin/products/export          -- export CSV
```

### `BannersModule`
```
GET    /banners/:pageType/:pageId?     -- get active banners for a page (public)
POST   /admin/banners                  -- create (requires: banners.manage)
PATCH  /admin/banners/:id              -- edit
DELETE /admin/banners/:id              -- delete
PATCH  /admin/banners/reorder          -- reorder
```

### `NavModule`
```
GET    /nav                            -- full nav tree for frontend (public, Redis cached)
POST   /admin/nav                      -- create nav item
PATCH  /admin/nav/:id                  -- edit
DELETE /admin/nav/:id                  -- delete
PATCH  /admin/nav/reorder              -- reorder + nest (drag-drop)
```

---

## Key Implementation Details

### Price Logic
- `base_price_cents` and `discount_percent` are stored
- `final_price_cents` is computed on save: `Math.round(base * (1 - discount / 100))`
- 50%+ discount automatically makes the product flash-sale-ineligible-for-exchange (checked server-side on exchange request, not stored separately)
- Flash Sale flag `is_flash_sale` is set by admin when creating a Flash Sale promotion

### CottoCool Badge
- `is_cottocool` boolean on product
- Returns in all PLP and PDP API responses
- Frontend displays a badge based on this flag

### Image Upload
- Upload endpoint accepts multipart/form-data
- Save to VPS local storage (`/uploads/products/`) or S3 (based on `UPLOAD_DEST` env var)
- Return public URL
- First uploaded image = primary by default

### Inventory & Low Stock
- `product_variants.stock_qty` tracks inventory per size/colour
- `products.stock_total` = sum of all variants (computed on variant update)
- When `stock_qty` ≤ `products.low_stock_threshold` → emit `low_stock` Socket.IO event to `/admin` namespace

### Bulk CSV Import
CSV format for import:
```
name,slug,category_slug,sub_category_slug,tier_slug,base_price_usd,discount_percent,is_cottocool,description,sku,size,colour,stock_qty
```
- Validate all FK slugs resolve to existing records
- Upsert on `sku` (insert if new, update stock if existing)
- Return a report: `{ imported: N, updated: N, errors: [{row, reason}] }`

### Nav Cache
- `GET /nav` response is cached in Redis with key `nav:tree`
- TTL: 1 hour
- Cache invalidated whenever any nav item, category, or season is created/edited/deleted

---

## Strapi CMS Integration

Strapi is used to manage:
- CMS pages (about-us, policies, size-guide — see Sprint 11)
- Hero banners (optional: can also use the `banners` table directly)

Set up Strapi in this sprint:
1. Access Strapi at `http://localhost:1337/admin`
2. Create content types: `CmsPage` (slug, title, contentBlocks, isPublished), `SizeGuide`
3. Generate API token → store in `STRAPI_API_TOKEN` env var
4. Create `CmsModule` in NestJS that proxies Strapi API calls (caches responses in Redis for 5 min)

---

## Done When
- [ ] `GET /categories` returns all active categories with sub-categories
- [ ] Admin can create/edit/delete/reorder categories, sub-categories, and tiers from dashboard
- [ ] Admin can assign tiers to sub-categories (many-to-many)
- [ ] Admin can create a product with all fields, images, and variants
- [ ] Low-stock Socket.IO event fires to `/admin` when stock drops below threshold
- [ ] Bulk CSV import works and returns error report for invalid rows
- [ ] CSV export returns all products with variants
- [ ] `GET /nav` returns the full navigation tree (Redis cached)
- [ ] Banner API returns active banners for a given page context
- [ ] Strapi is connected and `GET /cms/pages/:slug` returns published CMS content
