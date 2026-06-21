import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersRefreshTokensOtpSocial20260614000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email              VARCHAR(255) NOT NULL UNIQUE,
        password_hash      VARCHAR(255),
        phone              VARCHAR(50),
        first_name         VARCHAR(100),
        last_name          VARCHAR(100),
        avatar_url         VARCHAR(500),
        role_id            UUID REFERENCES roles(id) ON DELETE SET NULL,
        is_email_verified  BOOLEAN NOT NULL DEFAULT false,
        is_active          BOOLEAN NOT NULL DEFAULT true,
        last_login_at      TIMESTAMPTZ,
        created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at         TIMESTAMPTZ
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_users_email ON users(email)`);
    await queryRunner.query(`CREATE INDEX idx_users_role_id ON users(role_id)`);

    await queryRunner.query(`
      CREATE TABLE refresh_tokens (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash  VARCHAR(500) NOT NULL UNIQUE,
        expires_at  TIMESTAMPTZ NOT NULL,
        revoked_at  TIMESTAMPTZ,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id)`);

    await queryRunner.query(`
      CREATE TABLE otp_codes (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
        phone_or_email  VARCHAR(255) NOT NULL,
        code            VARCHAR(10) NOT NULL,
        type            VARCHAR(50) NOT NULL,
        expires_at      TIMESTAMPTZ NOT NULL,
        used_at         TIMESTAMPTZ,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE social_accounts (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider     VARCHAR(50) NOT NULL,
        provider_id  VARCHAR(255) NOT NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(provider, provider_id)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id)`);

    await queryRunner.query(`
      ALTER TABLE role_permissions
        ADD CONSTRAINT fk_role_permissions_granted_by
        FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS fk_role_permissions_granted_by`);
    await queryRunner.query(`DROP TABLE IF EXISTS social_accounts`);
    await queryRunner.query(`DROP TABLE IF EXISTS otp_codes`);
    await queryRunner.query(`DROP TABLE IF EXISTS refresh_tokens`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
}
