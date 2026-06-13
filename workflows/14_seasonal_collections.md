# Sprint 13 — Seasonal Collections
**Workflow file for Claude Code**

## Goal
Build seasonal collection pages (Eid Edit, SS26, etc.), the archive mechanism, and admin management. New seasons are created from the dashboard — no code changes needed to launch a new collection.

## Prerequisites
- Sprint 3 complete: categories + tiers in DB
- Sprint 10 complete: admin dashboard working
- Sprint 5 complete: PLP + PDP working (seasonal pages reuse these components)

---

## Data Model (already in Sprint 1 schema)

```sql
seasons table:
  id, name, slug, tagline, description_html, hero_image_url,
  hero_video_url (optional), lookbook_images (jsonb array),
  is_active, is_archived, starts_at, ends_at,
  meta_title, meta_description, og_image_url,
  sort_order, created_at, updated_at

season_sub_collections table:
  id, season_id, name, slug, description_html, image_url, sort_order
```

Products are linked to seasons through their `sub_category` + `tier` or via a `product_seasons` junction if a product belongs directly to a season (add if needed):
```sql
CREATE TABLE product_seasons (
  product_id uuid REFERENCES products(id),
  season_id  uuid REFERENCES seasons(id),
  PRIMARY KEY (product_id, season_id)
);
```
Admin assigns products to seasons from the product edit page.

---

## API Endpoints

```
GET  /seasons                      -- list active seasons (public, Redis cached 30min)
GET  /seasons/:slug                -- get season detail + sub-collections (public)
GET  /seasons/:slug/products       -- get products for this season (paginated, filter/sort)
GET  /seasons/archive              -- list archived seasons (public)

POST   /admin/seasons              -- create new season
PATCH  /admin/seasons/:id          -- edit season
DELETE /admin/seasons/:id          -- delete (only if no products linked)
POST   /admin/seasons/:id/archive  -- archive season
POST   /admin/seasons/:id/activate -- activate season
POST   /admin/seasons/:id/products -- link products to season (bulk)
DELETE /admin/seasons/:id/products -- unlink products from season
```

---

## Seasonal Collection Page `/season/:slug`

### Hero Section
- Full-bleed hero image or autoplay video (no audio) with overlay text
- Season name, tagline, CTA: "Shop Now" → scrolls to product grid
- If video: fallback to hero image on mobile / slow connections
- Hero content served from `seasons` table — 100% dashboard-managed

### Lookbook Section
- Horizontal scroll or masonry grid of editorial images
- Images from `seasons.lookbook_images` (jsonb array of `{ url, caption, link }`)
- Clicking an image opens it in a lightbox (or links to a product if `link` is set)

### Sub-Collections
- Row of cards linking to sub-collection filters
- Each card: image + name → links to `/season/:slug?sub=:subCollectionSlug`
- Sub-collection cards come from `season_sub_collections` table

### Product Grid
- Same component as PLP
- Filtered by season: `GET /seasons/:slug/products`
- Same filter sidebar (size, tier, price range, sub-collection)
- Same sort options
- Infinite scroll or pagination

---

## Archive Page `/season/archive`

Shows all archived seasons as cards:
- Season name, dates, hero thumbnail, "View Archive" link
- Sorted by `ends_at` desc (most recent first)
- Archived seasons are browseable but show a "This collection has ended" banner at the top
- Products in archived seasons are still visible but marked "No longer available" if out of stock

---

## Homepage Featured Season

The homepage has a section: "Current Collection" or "Now Showing":
- Fetches the active season with the highest `sort_order`
- Shows hero image, name, tagline, Shop CTA
- Content fully driven by whichever season admin marks as active

---

## Admin Management `/admin/seasons`

### Season List
- Table: name, slug, status (active/archived/draft), start/end dates, product count
- Bulk actions: activate, archive

### Create / Edit Season Form
- Name, slug (auto-generated, editable)
- Tagline, description (rich text)
- Hero image upload (desktop) + Hero image upload (mobile) separately
- Hero video URL (optional, for autoplay video hero)
- Lookbook images: drag-and-drop multi-upload with caption + link per image
- Start date + end date
- Status: Draft | Active | Archived
- SEO: meta_title, meta_description, og_image
- Sub-collections: add named sub-collections with image (appears as filter + card on season page)

### Link Products to Season
Within the season edit page:
- "Add Products" button → search/filter product catalogue → checkbox select → bulk assign
- Shows currently linked products in a table (with remove button)

### Archive Action
Admin clicks "Archive Season":
- Sets `is_archived = true`, `is_active = false`
- Season moves to the archive page
- Products remain browseable but no longer appear in main PLP (unless they have other active categories)

---

## Auto-Archive (Optional)
If `seasons.ends_at` is set, a scheduled job (cron, daily) auto-archives seasons when `ends_at < now()`. Admin can override manually.

---

## Countdown on Season Page (Pre-launch)

If `season.starts_at` is in the future and admin enables a countdown (`is_active = false`, `show_countdown = true`):
- Show a coming-soon page: hero + countdown timer
- No product grid visible yet
- Email capture: "Notify me when this collection drops" → stores email in a simple `collection_waitlist` table
- On launch day, admin activates season → real page shows

---

## Done When
- [ ] New seasons created from admin dashboard — no code changes needed
- [ ] Season page shows hero, lookbook, sub-collections, product grid
- [ ] Products correctly linked to seasons and appear in season product grid
- [ ] Season filters (size, tier, sub-collection) work correctly
- [ ] Archive page lists all archived seasons
- [ ] Archived season pages show "collection has ended" banner
- [ ] Homepage featured season section shows the active season from DB
- [ ] Admin can reorder seasons (sort_order) from dashboard
- [ ] Auto-archive cron runs daily and archives expired seasons
- [ ] Coming-soon countdown works for pre-launch seasons
- [ ] Email capture for waitlist works on coming-soon page
- [ ] All season content (hero, lookbook, tagline) is dashboard-manageable
