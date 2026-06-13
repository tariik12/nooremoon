# Command: /sprint

Starts a sprint implementation session by loading the corresponding workflow file.

## Usage
```
/sprint <number>
```

Examples:
- `/sprint 0` — Project setup & monorepo scaffold
- `/sprint 1` — Database schema & migrations
- `/sprint 7` — Checkout & payments

## What This Command Does

Delegates to the `sprint-runner` skill. See `.claude/skills/sprint-runner/SKILL.md` for the full execution plan.

Short version:
1. Reads the sprint workflow file from `workflows/`
2. States the goal and step sequence
3. Executes each step immediately
4. Reports the "Done When" checklist at the end

## Before Running Any Sprint

Check:
- Docker is running: `docker ps`
- Containers are up: `docker compose ps`
- Database is reachable: `docker compose exec postgres psql -U postgres -c '\l'`
- Previous sprint's migrations have run: `pnpm --filter apps/api run migration:show`
- `.env` has all required values for this sprint (see `workflows/00_master_build_guide.md` for the full env template)

## Sprint Dependency Chain

```
Sprint 0 (setup) → Sprint 1 (DB) → Sprint 2 (auth)
                                          ↓
                          Sprint 3 (products) → Sprint 4 (product pages)
                                          ↓
                          Sprint 5 (search) → Sprint 6 (cart) → Sprint 7 (checkout)
                                                                        ↓
                          Sprint 8 (orders) → Sprint 9 (loyalty/gift cards)
                                                                        ↓
                          Sprint 10 (admin) → Sprint 11 (CMS) → Sprint 12 (nav)
                                          ↓
                          Sprint 13 (seasons) → Sprint 14 (PWA)
                                                                        ↓
                          Sprint 15 (SEO) → Sprint 16 (testing & launch)
```

Do not skip sprints. Each sprint assumes the previous one is complete.
