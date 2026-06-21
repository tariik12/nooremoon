import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExchangeRequests20260614000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE exchange_requests (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
        order_item_id     UUID NOT NULL REFERENCES order_items(id) ON DELETE RESTRICT,
        user_id           UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        requested_size    VARCHAR(20),
        requested_colour  VARCHAR(100),
        status            VARCHAR(50) NOT NULL DEFAULT 'requested',
        reason            TEXT,
        admin_notes       TEXT,
        resolved_at       TIMESTAMPTZ,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_exchange_requests_order_id ON exchange_requests(order_id)`);
    await queryRunner.query(`CREATE INDEX idx_exchange_requests_user_id ON exchange_requests(user_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS exchange_requests`);
  }
}
