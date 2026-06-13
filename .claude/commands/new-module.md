# Command: /new-module

Scaffolds a complete NestJS module with correct project conventions.

## Usage
```
/new-module <ModuleName>
```

Examples:
- `/new-module Promotions`
- `/new-module StoreLocations`
- `/new-module EmailTemplates`

## What This Command Does

Generates the full module structure following project conventions:

```bash
# Create module via NestJS CLI
pnpm --filter apps/api exec nest generate module $ARGUMENTS --no-spec
pnpm --filter apps/api exec nest generate controller $ARGUMENTS --no-spec
pnpm --filter apps/api exec nest generate service $ARGUMENTS --no-spec
```

Then creates/updates these files with boilerplate:

### Entity (`src/<module>/entities/<module>.entity.ts`)
- UUID primary key
- `created_at` and `updated_at` columns
- All columns typed correctly (integer for money, varchar for strings)

### DTOs (`src/<module>/dto/`)
- `create-<module>.dto.ts` — with class-validator decorators
- `update-<module>.dto.ts` — extends Create DTO with `PartialType`

### Controller (`src/<module>/<module>.controller.ts`)
- Customer routes: standard CRUD
- Admin routes: under `/admin/` prefix with `@RequirePermission()` on each endpoint
- `@UseGuards(JwtAuthGuard, PermissionGuard)` on all protected routes

### Service (`src/<module>/<module>.service.ts`)
- Constructor injects TypeORM repository
- Redis cache client injected (for cacheable data)
- Methods: `findAll()`, `findOne()`, `create()`, `update()`, `remove()`
- Cache invalidation on `create()`, `update()`, `remove()` if data is cached

### Module (`src/<module>/<module>.module.ts`)
- Imports TypeOrmModule.forFeature with entity
- Exports service (so other modules can inject it)

## Permission Naming Convention

Use `<resource>.<action>` format:
```
promotions.view
promotions.manage
store-locations.view
store-locations.manage
email-templates.manage
```

Add these permission keys to the seed file after scaffolding.
