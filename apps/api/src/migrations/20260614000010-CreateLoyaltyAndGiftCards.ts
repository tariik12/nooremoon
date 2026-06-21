import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLoyaltyAndGiftCards20260614000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE loyalty_tiers (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name             VARCHAR(100) NOT NULL UNIQUE,
        min_points       INTEGER NOT NULL,
        points_per_dollar INTEGER NOT NULL DEFAULT 1,
        discount_percent INTEGER NOT NULL DEFAULT 0,
        sort_order       INTEGER NOT NULL DEFAULT 0,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE loyalty_accounts (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        tier_id         UUID REFERENCES loyalty_tiers(id) ON DELETE SET NULL,
        points_balance  INTEGER NOT NULL DEFAULT 0,
        lifetime_points INTEGER NOT NULL DEFAULT 0,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE loyalty_transactions (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id  UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
        type        VARCHAR(50) NOT NULL,
        points      INTEGER NOT NULL,
        order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
        description VARCHAR(500),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_loyalty_transactions_account_id ON loyalty_transactions(account_id)`);

    await queryRunner.query(`
      CREATE TABLE gift_card_templates (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        amount_cents INTEGER NOT NULL,
        label       VARCHAR(100) NOT NULL,
        image_url   VARCHAR(500),
        is_active   BOOLEAN NOT NULL DEFAULT true,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE gift_cards (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code            VARCHAR(50) NOT NULL UNIQUE,
        template_id     UUID REFERENCES gift_card_templates(id) ON DELETE SET NULL,
        amount_cents    INTEGER NOT NULL,
        balance_cents   INTEGER NOT NULL,
        purchased_by    UUID REFERENCES users(id) ON DELETE SET NULL,
        recipient_email VARCHAR(255),
        recipient_name  VARCHAR(200),
        expires_at      TIMESTAMPTZ,
        is_active       BOOLEAN NOT NULL DEFAULT true,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE gift_card_redemptions (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE RESTRICT,
        order_id     UUID REFERENCES orders(id) ON DELETE SET NULL,
        user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
        amount_cents INTEGER NOT NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_gift_card_redemptions_gift_card_id ON gift_card_redemptions(gift_card_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS gift_card_redemptions`);
    await queryRunner.query(`DROP TABLE IF EXISTS gift_cards`);
    await queryRunner.query(`DROP TABLE IF EXISTS gift_card_templates`);
    await queryRunner.query(`DROP TABLE IF EXISTS loyalty_transactions`);
    await queryRunner.query(`DROP TABLE IF EXISTS loyalty_accounts`);
    await queryRunner.query(`DROP TABLE IF EXISTS loyalty_tiers`);
  }
}
