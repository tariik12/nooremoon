# Command: /new-migration

Creates a new TypeORM migration for the NestJS API.

## Usage
```
/new-migration <MigrationName>
```

Example: `/new-migration AddTrackingNumberToOrders`

## What This Command Does

1. Generates the migration file using TypeORM CLI:
```bash
pnpm --filter apps/api run migration:generate -- src/migrations/$ARGUMENTS
```

2. Opens the generated file and confirms:
   - The `up()` method contains the correct SQL
   - The `down()` method correctly reverses the change
   - Money columns are `integer` (not `decimal` or `float`)
   - New tables have `uuid` PKs with `gen_random_uuid()`
   - New tables have `created_at` and `updated_at` columns

3. Runs the migration to apply it:
```bash
pnpm --filter apps/api run migration:run
```

4. Confirms the migration ran successfully.

## Migration Naming Conventions

Use PascalCase that describes what changed:
- `CreateOrdersTable` — new table
- `AddTrackingNumberToOrders` — new column on existing table
- `CreateIndexOnProductsSearchVector` — add index
- `AddPaymentGatewaysTable` — new table
- `AlterProductsAddCottoCoolFlag` — alter existing table

## pnpm Scripts Required in apps/api/package.json

Make sure these scripts exist (add them if they don't):
```json
{
  "scripts": {
    "migration:generate": "typeorm migration:generate -d src/data-source.ts",
    "migration:run": "typeorm migration:run -d src/data-source.ts",
    "migration:revert": "typeorm migration:revert -d src/data-source.ts",
    "migration:show": "typeorm migration:show -d src/data-source.ts"
  }
}
```

## TypeORM Data Source (apps/api/src/data-source.ts)

```typescript
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,     // NEVER change this
  logging: process.env.NODE_ENV === 'development',
});
```
