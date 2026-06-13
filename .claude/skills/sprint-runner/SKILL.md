# Skill: Sprint Runner

Loads a sprint workflow file and guides the implementation step by step.

## When This Skill Is Used

When the user runs `/sprint <number>` (e.g. `/sprint 1`, `/sprint 3`).

## What to Do

1. Read the matching workflow file: `workflows/0N_*.md` where N is the sprint number
2. Read `CLAUDE.md` (already in context) to confirm tech stack and rules
3. State clearly: which sprint this is, what the goal is, and the step sequence
4. Begin Step 1 immediately — do not wait for the user to say "go"
5. After completing each step, tick it off and move to the next
6. Pause only when you need input the user must provide (e.g. a missing env var value, a design decision)
7. At the end, run through the "Done When" checklist and report any items not yet passing

## Sprint Number to File Map

| Sprint | File |
|--------|------|
| 0 | `workflows/01_project_setup.md` |
| 1 | `workflows/02_database_schema.md` |
| 2 | `workflows/03_auth_module.md` |
| 3 | `workflows/04_product_catalogue.md` |
| 4 | `workflows/05_product_pages.md` |
| 5 | `workflows/06_search.md` |
| 6 | `workflows/07_shopping_bag.md` |
| 7 | `workflows/08_checkout_stripe.md` |
| 8 | `workflows/09_order_management.md` |
| 9 | `workflows/10_loyalty_giftcards.md` |
| 10 | `workflows/11_admin_panel.md` |
| 11 | `workflows/12_cms_content_pages.md` |
| 12 | `workflows/13_navigation_megamenu.md` |
| 13 | `workflows/14_seasonal_collections.md` |
| 14 | `workflows/15_pwa_mobile.md` |
| 15 | `workflows/16_seo_performance.md` |
| 16 | `workflows/17_testing_launch.md` |

## Rules to Enforce During Every Sprint

- Use `pnpm` — never `npm` or `yarn`
- Use `git bash` commands (not PowerShell syntax)
- Every new migration: `synchronize: false`, UUID PKs, money as integers
- Every admin endpoint: `@RequirePermission()` decorator, not `@Roles()`
- No hardcoded business values — all from DB or `app_settings`
- After creating a migration: run it before writing entity code that depends on it
