# Command: /check-dynamic

Scans the codebase for hardcoded values that should be database-driven.

## Usage
```
/check-dynamic
```

Run this at the end of any sprint or before committing a feature.

## What This Command Does

Searches the codebase for common dynamic-first violations:

```bash
# 1. Hardcoded role names in guards/decorators
grep -r "Roles\('admin'\)\|Roles\('staff'\)\|Roles\('superadmin'\)" apps/api/src/

# 2. UserRole or TierName enum
grep -r "UserRole\|TierName\|export enum UserRole\|export enum TierName" packages/ apps/

# 3. Hardcoded monetary constants
grep -rn "SHIPPING_RATE\|FREE_SHIPPING\|const.*= 25\|const.*= 150\|= 2500\|= 15000" apps/api/src/

# 4. Hardcoded email template text (subject/body not from template)
grep -rn "subject:.*'Your order\|body:.*'Dear\|html:.*'<html" apps/api/src/

# 5. Hardcoded nav items in frontend JSX
grep -rn "href.*\/c\/\|href.*\/s\/" apps/web/app/ | grep -v "params\|slug\|props\|href="

# 6. Hardcoded payment method list
grep -rn "\['stripe', 'bkash'\]\|\['stripe', 'bkash', 'eps'\]" apps/

# 7. Synchronize: true in TypeORM
grep -rn "synchronize: true" apps/api/src/
```

## How to Report

For each match found, report:
```
[VIOLATION] path/to/file:line
Value: <the hardcoded value>
Should be: <where it should come from>
```

If no violations: output "No dynamic-first violations found."

## False Positive Guidance

These are acceptable and should be ignored:
- `OrderStatus.CONFIRMED` — this is a workflow state enum, allowed in `packages/shared`
- `PaymentStatus.PAID` — workflow state enum, allowed
- `ExchangeStatus.APPROVED` — workflow state enum, allowed
- String literals in migration SQL (the values being inserted into the DB are fine)
- Test files (`*.spec.ts`) — test fixtures can use hardcoded values
