# Sprint 2 — Auth Module
**Workflow file for Claude Code**

## Goal
Build the complete authentication system: registration, email verification, login, JWT refresh tokens, OTP login, Google/Facebook OAuth2, password reset, and the dynamic permission guard.

## Prerequisites
- Sprint 1 complete: database schema migrated, roles and permissions seeded

---

## NestJS Modules to Create

### `AuthModule`
**Endpoints:**
```
POST /auth/register              -- email + password registration
POST /auth/verify-email          -- verify email with token
POST /auth/login                 -- email + password login
POST /auth/refresh               -- refresh JWT using refresh token
POST /auth/logout                -- revoke refresh token
POST /auth/forgot-password       -- send reset link via SMTP
POST /auth/reset-password        -- reset password with token
POST /auth/otp/request           -- request OTP to phone/email
POST /auth/otp/verify            -- verify OTP and return JWT
GET  /auth/google                -- redirect to Google OAuth
GET  /auth/google/callback       -- Google OAuth callback
GET  /auth/facebook              -- redirect to Facebook OAuth
GET  /auth/facebook/callback     -- Facebook OAuth callback
GET  /auth/me                    -- get current user (requires JWT)
```

### `UsersModule`
**Endpoints:**
```
GET    /users/profile            -- get own profile
PATCH  /users/profile            -- update own profile
POST   /users/addresses          -- add address
GET    /users/addresses          -- list own addresses
PATCH  /users/addresses/:id      -- update address
DELETE /users/addresses/:id      -- delete address
POST   /users/addresses/:id/default  -- set as default address
DELETE /users/account            -- soft-delete account (with confirmation)
```

---

## Implementation Details

### JWT Strategy
- **Access token:** 15 minutes expiry
- **Refresh token:** 30 days expiry, stored as bcrypt hash in `refresh_tokens` table
- On refresh: validate hash, issue new access + refresh token pair, revoke old refresh token
- On logout: revoke refresh token in DB

### OTP Flow
1. `POST /auth/otp/request` → generate 6-digit code, store in `otp_codes`, send via SYSSMS gateway
2. `POST /auth/otp/verify` → validate code + expiry, mark as used, return JWT pair
3. OTP expires after 10 minutes; only 3 attempts allowed before lockout

### Password Reset Flow
1. `POST /auth/forgot-password` → generate token (UUID), store hash in `otp_codes` with type `password_reset`, send SMTP email
2. `POST /auth/reset-password` → validate token, update `password_hash`, revoke all refresh tokens for user

### Social Login (Google + Facebook)
- Use `passport-google-oauth20` and `passport-facebook`
- On callback: find or create user in `users` table, upsert `social_accounts` row
- Return JWT pair (same format as regular login)
- If email already exists in `users` (from regular registration), link the social account

### Dynamic Permission Guard

The permission guard reads from the database (with Redis cache) — it does NOT hardcode role names:

```typescript
// apps/api/src/common/guards/permission.guard.ts

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cacheManager: Cache,
    private readonly rolesRepo: Repository<Role>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );
    if (!requiredPermission) return true; // no permission required = public

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    // Load permissions from Redis cache (key: `role_perms:${user.role_id}`)
    // Cache miss: load from DB, cache for 5 minutes
    const permissions = await this.getPermissionsForRole(user.role_id);
    return permissions.includes(requiredPermission);
  }

  private async getPermissionsForRole(roleId: string): Promise<string[]> {
    const cacheKey = `role_perms:${roleId}`;
    const cached = await this.cacheManager.get<string[]>(cacheKey);
    if (cached) return cached;

    const role = await this.rolesRepo.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    const keys = role?.permissions?.map(p => p.key) ?? [];
    await this.cacheManager.set(cacheKey, keys, 300); // 5 min TTL
    return keys;
  }
}

// Decorator usage in controllers:
@RequirePermission('orders.view')
@Get('/orders')
getOrders() { ... }
```

When admin updates role permissions from dashboard → call `cacheManager.del('role_perms:' + roleId)` to invalidate immediately.

### Biometric Auth (PWA)
- Biometric auth is handled client-side via the Web Authentication API (WebAuthn)
- The backend stores a `public_key` credential per user (add `webauthn_credentials` table in this sprint)
- Endpoints:
  ```
  POST /auth/webauthn/register-options    -- get challenge to register credential
  POST /auth/webauthn/register-verify     -- verify and store credential
  POST /auth/webauthn/login-options       -- get challenge for login
  POST /auth/webauthn/login-verify        -- verify credential and return JWT
  ```

---

## Email Templates (SMTP via Nodemailer + Handlebars)

Create Handlebars templates in `apps/api/src/email/templates/`:
- `verify-email.hbs` — email verification link
- `reset-password.hbs` — password reset link
- `otp.hbs` — OTP code
- `welcome.hbs` — welcome email after verified registration

All emails sent from `support@nooremoon.global`.

---

## Security Requirements
- Rate limit: `POST /auth/login` — 5 attempts per 15 min per IP (use Redis + `nestjs-throttler`)
- Rate limit: `POST /auth/otp/request` — 3 per 10 min per phone/email
- Account lock: after 5 failed logins → set `is_active = false`, send unlock email
- All passwords hashed with bcrypt, cost factor 12
- Refresh tokens stored as bcrypt hash — raw token sent to client only once

---

## Done When
- [ ] `POST /auth/register` creates user, sends verification email
- [ ] `POST /auth/login` returns access + refresh JWT pair
- [ ] `POST /auth/refresh` issues new token pair and revokes old refresh token
- [ ] `POST /auth/otp/request` sends SMS via SYSSMS; `POST /auth/otp/verify` returns JWT
- [ ] Google OAuth flow completes and returns JWT
- [ ] Facebook OAuth flow completes and returns JWT
- [ ] `GET /auth/me` returns user + role name (but not permissions list — loaded on demand)
- [ ] PermissionGuard blocks access when user lacks required permission
- [ ] Redis caches role permissions; cache invalidates when role is updated from dashboard
- [ ] Rate limiting applied to login and OTP endpoints
