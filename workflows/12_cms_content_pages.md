# Sprint 11 — CMS Content Pages
**Workflow file for Claude Code**

## Goal
Build all static/semi-static content pages driven by the CMS. Content is editable from the admin dashboard — no code changes needed to update page text, images, or structure.

## Prerequisites
- Sprint 4 complete: Strapi CMS container running
- Sprint 10 complete: admin dashboard CMS editor working
- Sprint 9 complete: email templates working

---

## CMS Architecture

Content is stored in two places:
1. **`cms_pages` table** — for simple page content (HTML/rich-text, metadata, slug)
2. **Strapi** — for more structured, complex content (size guides with tables, store locations with maps, loyalty programme explainer with tier cards)

Frontend fetches from the NestJS API (`/cms/pages/:slug`), which internally reads from `cms_pages` (simple) or Strapi REST API (structured). Admin edits both from the admin dashboard CMS editor.

### API Endpoints
```
GET    /cms/pages                 -- list all CMS pages (slug + title, for sitemap)
GET    /cms/pages/:slug           -- get page content by slug
GET    /admin/cms/pages           -- admin list (all pages, draft + published)
POST   /admin/cms/pages           -- create new CMS page
PATCH  /admin/cms/pages/:slug     -- update page (content, meta, status)
DELETE /admin/cms/pages/:slug     -- delete CMS page
```

### Page Status
Every CMS page has `status = DRAFT | PUBLISHED`. Customers see only PUBLISHED pages. Admin can preview DRAFT pages with a `?preview=1` query param + admin JWT.

---

## Pages to Build

### 1. Size Guide `/size-guide`
- Full size guide with measurement charts per category (men's, women's, kids')
- Content stored in Strapi as structured data (not raw HTML): `{ category, measurements: [{label, cm, inches}] }`
- Admin can add/edit size charts from Strapi admin panel
- Page renders each chart as a responsive table
- Also accessible as a modal from PDP (same content, opened inline)

### 2. Loyalty Programme `/loyalty-programme`
- Explains the programme: how to earn, how to redeem, tier benefits
- Tier cards loaded dynamically from `loyalty_tiers` table (so if admin adds a tier, it appears here automatically)
- Hero banner from `banners` table (placement = `LOYALTY_HERO`)
- CTA: "Create an account" (if not logged in) or "View my points" (if logged in)

### 3. Gift Cards `/gift-cards` (CMS wrapper)
- Hero section: content from CMS (`gift-cards` slug)
- Below hero: gift card denominations from API (`GET /gift-cards/templates`)
- How it works section: CMS content
- FAQ section: CMS content (admin editable)

### 4. About Us `/about`
- Full CMS page: brand story, team, values, editorial images
- Content from `cms_pages` table (slug = `about-us`)
- Admin can paste rich text + insert images from dashboard
- OG image configurable per page

### 5. Store Locations `/store-locator`
- List of all store locations from `store_locations` table
- Fields: name, address, phone, email, open_hours, lat, lng, image_url
- Map integration: Google Maps embed (map key stored in `app_settings`)
- Each location: card with hours + "Get Directions" link
- Admin manages locations from `/admin/store-locations`

### 6. Privacy Policy `/privacy-policy`
- CMS page (slug = `privacy-policy`)
- Auto-updated date header (reads `updated_at` from `cms_pages`)
- Structured as sections with anchor nav (table of contents)

### 7. Terms & Conditions `/terms`
- CMS page (slug = `terms-and-conditions`)
- Same layout as Privacy Policy

### 8. Intellectual Property `/intellectual-property`
- CMS page (slug = `intellectual-property`)
- Content about copyright, trademark notices
- Required by SRS Section 4.21

### 9. Return & Exchange Policy `/exchange-policy`
- CMS page (slug = `exchange-policy`)
- Content explains 7-day window, eligibility (no Flash Sale items, no items 50%+ off)
- Link from Order Detail page's "Request Exchange" flow
- Key policy points pulled from `app_settings` where applicable (e.g. `exchange_window_days`)

### 10. Shipping Information `/shipping`
- CMS page (slug = `shipping-info`)
- Table showing shipping rates and thresholds — content from `app_settings` rendered into CMS template
- Estimated delivery times (CMS editable)
- International shipping info (CMS editable)

### 11. Contact Us `/contact`
- CMS content area (intro text, address, phone)
- Contact form: name, email, subject, message → sends to support email via SMTP
- Support email address from `app_settings` key `support_email`
- reCAPTCHA on form (key from `app_settings`)

### 12. FAQ `/faq`
- CMS page with accordion UI
- Structure: `{ questions: [{ question, answer }] }` stored in Strapi
- Grouped by category (Orders, Shipping, Returns, Products, Payment)
- Admin can add/remove/reorder questions from Strapi

### 13. 404 Page
- Custom 404 with search bar + links to popular categories
- Categories loaded from API (always live, not hardcoded)

### 14. Chat Widget (all pages)
- Floating chat button bottom-right
- Opens conversation thread (Socket.IO `/chat` namespace)
- If user is logged in, conversation is linked to their account
- If guest, collected email first then opens chat
- Shows admin online/offline status (controlled from admin dashboard toggle)
- Uses same `conversations` + `messages` tables as admin messaging

---

## CMS Admin Editor (`/admin/cms`)

- List of all CMS pages with status indicator
- Click page → opens WYSIWYG editor (use Quill or TipTap)
- Editor supports: headings, bold, italic, links, images (upload to S3/storage), bullet lists, tables
- SEO panel: meta_title, meta_description, og_image (uploadable)
- Save as Draft or Publish buttons
- Preview button: opens the page in a new tab with `?preview=1`
- Change history: last 5 saves shown with timestamp + who saved

---

## Frontend Notes

### Dynamic Routing
All CMS pages resolve through Next.js App Router dynamic segment:
```typescript
// apps/web/app/(site)/[...slug]/page.tsx
// Fetches from GET /cms/pages/:slug
// Renders CMS HTML with dangerouslySetInnerHTML (sanitise with DOMPurify first)
// Falls back to 404 if slug not found or status = DRAFT (without preview token)
```

### SEO
Each CMS page exports metadata from `generateMetadata()`:
- `title`, `description` from `cms_pages.meta_title`, `cms_pages.meta_description`
- `openGraph` with `og_image`
- `canonical` set to the page URL
- JSON-LD `WebPage` schema

### Caching
CMS pages cached in Next.js with `revalidate: 3600` (1 hour).
When admin publishes a change → call Next.js revalidation endpoint `POST /api/revalidate?secret=TOKEN&path=/about` to flush cache immediately.

---

## Done When
- [ ] All 12 CMS pages render correctly at their slugs
- [ ] Admin can edit page content from dashboard without code changes
- [ ] Draft pages not visible to public (preview token required)
- [ ] Size guide renders correct measurement charts from Strapi
- [ ] Loyalty programme page shows tiers dynamically from DB
- [ ] Store locator shows all store locations with map embed
- [ ] Contact form sends email via SMTP to support_email from app_settings
- [ ] FAQ accordion works with content from Strapi
- [ ] Chat widget appears on all pages and connects via Socket.IO
- [ ] 404 page shows dynamic category links
- [ ] All CMS pages have correct meta tags for SEO
- [ ] Cache invalidation works when admin publishes a CMS update
