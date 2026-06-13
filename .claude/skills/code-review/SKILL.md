# Skill: Code Review

Reviews code against the NOOREMOON project principles before committing.

## When This Skill Is Used

When the user runs `/review` or asks "review this code" / "check this PR".

## What to Check

### 1. Dynamic-First Violations (highest priority)
Search for and flag any of these:
- Hardcoded role names: `'admin'`, `'superadmin'`, `'staff'` in guard decorators
- Hardcoded tier names: `'Legends Edit'`, `'Icons Edit'` as string literals
- Hardcoded prices or thresholds: `25`, `150`, `5000` used as monetary values without coming from settings
- Hardcoded nav items: JSX arrays of navigation links
- Hardcoded email template text: subject/body strings not loaded from DB
- `UserRole` or `TierName` enum references — these must not exist

### 2. Database Rules
- Any `synchronize: true` in TypeORM config
- Float/decimal columns for money (must be integer)
- Auto-increment integer PKs (must be UUID)
- Missing `created_at` / `updated_at` on entity

### 3. API Design
- `@Roles('admin')` or similar hardcoded role guards → must use `@RequirePermission()`
- Missing DTO validation decorators on POST/PATCH body params
- Admin routes not under `/admin/` prefix
- Missing Redis cache invalidation after admin write operations

### 4. Frontend
- `<img>` tags (must use `next/image`)
- Missing `alt` text on images
- Missing `width`/`height` on `<Image>` (causes CLS)
- `priority={true}` on more than the first above-the-fold image
- `fetch()` calls inside Client Components (must be in Server Components or user-triggered)
- Hardcoded text content that should come from CMS or settings

### 5. Security
- SQL injection risk: raw query string interpolation not using parameterised queries
- Missing input validation on any endpoint that accepts user data
- JWT tokens stored in localStorage (must be httpOnly cookies or memory)
- Webhook endpoints not validating signatures (Stripe, bKash, EPS)
- Payment totals computed client-side and trusted by server

## How to Report

For each issue found:
```
[SEVERITY] file:line — description of issue
Suggested fix: ...
```

Severity levels:
- `[CRITICAL]` — security vulnerability or data integrity issue
- `[P1]` — violates a core project principle (dynamic-first, TypeORM rules)
- `[P2]` — code quality or convention violation
- `[SUGGESTION]` — optional improvement
