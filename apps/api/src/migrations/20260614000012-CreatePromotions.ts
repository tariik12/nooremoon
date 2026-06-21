import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePromotions20260614000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE promotions (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name             VARCHAR(200) NOT NULL,
        code             VARCHAR(100) UNIQUE,
        type             VARCHAR(50) NOT NULL,
        discount_percent INTEGER,
        discount_cents   INTEGER,
        min_order_cents  INTEGER,
        max_uses         INTEGER,
        used_count       INTEGER NOT NULL DEFAULT 0,
        is_flash_sale    BOOLEAN NOT NULL DEFAULT false,
        is_active        BOOLEAN NOT NULL DEFAULT true,
        starts_at        TIMESTAMPTZ,
        ends_at          TIMESTAMPTZ,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS promotions`);
  }
}
