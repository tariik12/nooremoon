import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMessagingAndNotifications20260614000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE conversations (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        assigned_to  UUID REFERENCES users(id) ON DELETE SET NULL,
        status       VARCHAR(50) NOT NULL DEFAULT 'open',
        subject      VARCHAR(255),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_conversations_customer_id ON conversations(customer_id)`);
    await queryRunner.query(`CREATE INDEX idx_conversations_status ON conversations(status)`);

    await queryRunner.query(`
      CREATE TABLE messages (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        body             TEXT NOT NULL,
        is_read          BOOLEAN NOT NULL DEFAULT false,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_messages_conversation_id ON messages(conversation_id)`);

    await queryRunner.query(`
      CREATE TABLE notifications (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
        event       VARCHAR(100) NOT NULL,
        title       VARCHAR(255) NOT NULL,
        body        TEXT,
        data        JSONB,
        is_read     BOOLEAN NOT NULL DEFAULT false,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_notifications_user_id ON notifications(user_id)`);

    await queryRunner.query(`
      CREATE TABLE push_subscriptions (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        endpoint    VARCHAR(1000) NOT NULL,
        keys        JSONB NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id)`);

    await queryRunner.query(`
      CREATE TABLE webauthn_credentials (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        credential_id  VARCHAR(500) NOT NULL UNIQUE,
        public_key     TEXT NOT NULL,
        sign_count     INTEGER NOT NULL DEFAULT 0,
        device_name    VARCHAR(200),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE wishlists (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(user_id, product_id)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_wishlists_user_id ON wishlists(user_id)`);

    await queryRunner.query(`
      CREATE TABLE email_logs (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        to_email       VARCHAR(255) NOT NULL,
        subject        VARCHAR(255) NOT NULL,
        template_key   VARCHAR(100),
        status         VARCHAR(20) NOT NULL,
        error_message  TEXT,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS email_logs`);
    await queryRunner.query(`DROP TABLE IF EXISTS wishlists`);
    await queryRunner.query(`DROP TABLE IF EXISTS webauthn_credentials`);
    await queryRunner.query(`DROP TABLE IF EXISTS push_subscriptions`);
    await queryRunner.query(`DROP TABLE IF EXISTS notifications`);
    await queryRunner.query(`DROP TABLE IF EXISTS messages`);
    await queryRunner.query(`DROP TABLE IF EXISTS conversations`);
  }
}
