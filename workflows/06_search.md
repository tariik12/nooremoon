# Sprint 5 — Search
**Workflow file for Claude Code**

## Goal
Build global product search with as-you-type suggestions and a full-featured search results page.

## Prerequisites
- Sprint 3 complete: products in database

---

## Backend

### `SearchModule` Endpoints
```
GET /search/suggestions?q=panj        -- as-you-type (>= 2 chars)
GET /search?q=panjabi&tier=legends&... -- full search results (same filters as PLP)
```

### Search Implementation
Use **PostgreSQL full-text search** (`tsvector` / `tsquery`) for simplicity. No Elasticsearch needed at v1.

**What gets searched:**
- `products.name`
- `products.description`
- `categories.name`
- `sub_categories.name`
- `tiers.name`
- Product tags (if added later)

**PostgreSQL setup:**
```sql
-- Add tsvector column to products table (new migration)
ALTER TABLE products ADD COLUMN search_vector tsvector;

-- Populate
UPDATE products SET search_vector =
  to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,''));

-- Index
CREATE INDEX products_search_idx ON products USING gin(search_vector);

-- Trigger to keep updated
CREATE TRIGGER products_search_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(search_vector, 'pg_catalog.english', name, description);
```

### Suggestions Endpoint
- Query: `GET /search/suggestions?q=panj`
- Returns up to 8 results: mix of products, categories, sub-categories
- **Cached in Redis** per query string (TTL: 60s)
- Response time target: < 300ms

```typescript
// Response format
{
  products: [{ name, slug, image_url, price_cents, tier_name }],   // max 5
  categories: [{ name, slug }],                                      // max 2
  sub_categories: [{ name, slug, category_name }],                  // max 2
}
```

### Full Search Endpoint
- Same filter + sort options as PLP
- Searches across product name + description + category + sub-category + tier
- Returns paginated product list in PLP format

---

## Frontend

### Search Bar (in Header — all pages)
- Click search icon → search bar expands (or full-screen modal on mobile)
- As-you-type: debounce 300ms → call `GET /search/suggestions?q=...` after 2 chars
- Show dropdown with product thumbnails + category suggestions
- Press Enter or click "See all results" → navigate to `/search?q=...`
- Keyboard navigation: arrow keys through suggestions, Enter to select

### Search Results Page `/search`
- Same layout as PLP (filter sidebar + product grid)
- Shows: `"Showing X results for 'panjabi'"` heading
- Empty state: `"No results found for 'xyz'"` + suggested categories to browse
- Filters and sort same as PLP — reflected in URL query params

---

## Done When
- [ ] `GET /search/suggestions?q=pa` returns products + categories in < 300ms
- [ ] Suggestions are Redis-cached
- [ ] Full search returns correct filtered + paginated results
- [ ] Frontend search bar shows dropdown after 2 chars with debounce
- [ ] `/search?q=panjabi` renders PLP with filtered results
- [ ] Empty search state shows helpful message
- [ ] Filters and sort on search results page work correctly
