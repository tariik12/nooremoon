# Sprint 12 — Navigation & Mega-Menu
**Workflow file for Claude Code**

## Goal
Build the site-wide navigation: sticky header, mega-menu (desktop), hamburger drawer (mobile), and footer. All nav structure — items, dropdowns, column groups, featured images — is dashboard-managed via the `nav_items` table.

## Prerequisites
- Sprint 10 complete: admin nav builder working
- Sprint 3 complete: categories/tiers in DB

---

## Nav Data Model (already in schema)

```sql
nav_items table:
  id, label, type (LINK | DROPDOWN | EXTERNAL),
  href, target (_self | _blank),
  sort_order, parent_id (null = top-level),
  image_url (for featured column in mega-menu),
  is_active, created_at
```

Hierarchy: top-level items can have children (column groups). Column groups can have children (links).

### API
```
GET /navigation/main    -- full nav tree (public, Redis cached until admin changes it)
```

Response:
```json
[
  {
    "label": "Collections",
    "type": "DROPDOWN",
    "children": [
      {
        "label": "Legends Edit",
        "type": "LINK",
        "href": "/c/legends-edit",
        "children": [
          { "label": "New Arrivals", "href": "/c/legends-edit?sort=newest" },
          { "label": "Panjabi", "href": "/c/legends-edit?sub=panjabi" }
        ]
      },
      {
        "label": "Featured",
        "type": "FEATURED",
        "image_url": "...",
        "href": "/collections/eid-special"
      }
    ]
  },
  { "label": "Gift Cards", "type": "LINK", "href": "/gift-cards" },
  { "label": "Loyalty", "type": "LINK", "href": "/loyalty-programme" }
]
```

Cache key: `nav:main` — invalidated whenever admin saves nav from dashboard.

---

## Header Component

### Desktop Header (≥ 1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│  [NOOREMOON Logo]   Collections  Gift Cards  Loyalty  Sale      │
│                                   🔍 Search   ♡ Wishlist  🛍 Bag (3) │
└─────────────────────────────────────────────────────────────────┘
```

Behaviour:
- Sticky: `position: sticky; top: 0; z-index: 50`
- Transparent on homepage hero → becomes white + drop-shadow on scroll (threshold: 80px)
- Active nav item underline matches current route

### Mega-Menu (desktop)

Triggered by hover (with 150ms intent delay to prevent accidental triggers):
```
┌────────────────────────────────────────────────────────┐
│  Legends Edit          Icons Edit        [Featured Image]│
│  ─────────────         ──────────        [              ]│
│  New Arrivals          New Arrivals      Eid Special     │
│  Panjabi               Kurta             Shop now →     │
│  Fatua                 Panjabi                          │
│  Accessories           Accessories                      │
└────────────────────────────────────────────────────────┘
```

Implementation:
```typescript
// Use @radix-ui/react-navigation-menu or custom implementation
// Hover delay via onMouseEnter + setTimeout (clear on onMouseLeave)
// Full-width dropdown panel — position: absolute; left: 0; right: 0; top: 100%
// Trap keyboard focus when open (arrow keys, Tab, Escape)
// aria-expanded, aria-haspopup on triggers
```

### Mobile Header (< 1024px)

```
┌──────────────────────────────────────────┐
│  ☰   [NOOREMOON Logo]       🔍   🛍 (3) │
└──────────────────────────────────────────┘
```

Hamburger opens a full-height drawer from the left:
```
┌──────────────────────┐
│  [X] NOOREMOON       │
├──────────────────────│
│  Collections       ›  │
│  Gift Cards           │
│  Loyalty              │
│  Sale                 │
├──────────────────────│
│  My Account           │
│  Wishlist             │
│  Orders               │
└──────────────────────┘
```

"Collections ›" opens a sub-panel (slide right):
```
┌──────────────────────┐
│  ‹ Collections       │
├──────────────────────│
│  Legends Edit      ›  │
│  Icons Edit        ›  │
└──────────────────────┘
```

Each sub-category panel lists links. Back arrow returns to parent panel. Drawer closes on outside tap or "X" button.

---

## Announcement Bar

Above the header — full width, dismissable:
```
┌──────────────────────────────────────────────────────────┐
│  🎉  FREE SHIPPING on orders over £150 · Use code SAVE10  [X]│
└──────────────────────────────────────────────────────────┘
```

Content from `app_settings`:
```
announcement_bar_text     = 'FREE SHIPPING on orders over £150 · Use code SAVE10'
announcement_bar_visible  = 'true'
announcement_bar_bg_color = '#000000'
announcement_bar_text_color = '#FFFFFF'
```

Admin can update text + toggle visibility from Settings. Dismissed state stored in `sessionStorage` (reappears on new session).

---

## Search Bar

On click of 🔍 icon → full-screen search overlay:
```
┌──────────────────────────────────────────────────────────────┐
│  [✕]    Search NOOREMOON...                                  │
│                                                              │
│  RECENT SEARCHES                                             │
│  panjabi  fatua  legends edit                                │
│                                                              │
│  [results appear here as you type]                           │
└──────────────────────────────────────────────────────────────┘
```

- Recent searches stored in localStorage (last 5)
- Debounce 300ms → hits `GET /search/suggestions?q=...`
- Keyboard: Escape closes overlay, arrow keys navigate suggestions

---

## Footer

```
┌──────────────────────────────────────────────────────────────┐
│  NOOREMOON              Shop                 Help             │
│  [Brand description]    Collections          Shipping         │
│                         Gift Cards           Exchange Policy  │
│  [Instagram] [Facebook] Loyalty              Contact Us       │
│  [TikTok] [WhatsApp]    Store Locator        FAQ              │
│                                                              │
│  © 2025 NOOREMOON · Privacy Policy · Terms · IP Policy       │
└──────────────────────────────────────────────────────────────┘
```

Footer links are partially dynamic:
- "Shop" column: loads from `nav_items` (type = FOOTER_SHOP, managed from dashboard)
- "Help" column: loads from `nav_items` (type = FOOTER_HELP)
- Social links: from `app_settings` (instagram_url, facebook_url, tiktok_url, whatsapp_number)
- Copyright year: auto-computed in frontend (`new Date().getFullYear()`)

---

## Wishlist

Wishlist icon in header with count badge.
- Wishlist stored in DB: `wishlists` table (user_id, product_id)
- Endpoints:
```
GET    /wishlist            -- get own wishlist (auth required)
POST   /wishlist/:productId -- add to wishlist
DELETE /wishlist/:productId -- remove
```
- Heart icon on product cards: filled if in wishlist, outline if not
- Click toggles wishlist state (optimistic update)
- Guest users: store in localStorage, prompt to login on checkout

---

## Active State & Route Matching

Use Next.js `usePathname()` to determine active nav item:
- Exact match for top-level links
- Prefix match for dropdown items (e.g. pathname starts with `/c/` → "Collections" is active)
- Active item gets visual indicator (underline or colour change per Tailwind design tokens)

---

## Done When
- [ ] Header renders correctly on desktop and mobile
- [ ] Mega-menu appears on hover with correct column structure from DB
- [ ] Mega-menu has 150ms intent delay (no accidental triggers)
- [ ] Mega-menu is keyboard-accessible (arrows, Tab, Escape)
- [ ] Hamburger opens drawer with sub-panel navigation on mobile
- [ ] Announcement bar shows content from app_settings and is dismissable
- [ ] Admin can change announcement bar text/visibility without code change
- [ ] Search overlay opens with recent searches + live suggestions
- [ ] Footer social links and columns load from app_settings and nav_items
- [ ] Wishlist add/remove works with optimistic UI
- [ ] Header badge count updates when cart changes
- [ ] Active nav item highlighted based on current route
- [ ] All nav structure (mega-menu columns, links) is manageable from admin dashboard
