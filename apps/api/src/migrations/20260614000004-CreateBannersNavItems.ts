import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBannersNavItems20260614000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE banners (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title       VARCHAR(255) NOT NULL,
        subtitle    VARCHAR(500),
        image_url   VARCHAR(500) NOT NULL,
        link_url    VARCHAR(500),
        page_type   VARCHAR(50) NOT NULL,
        page_id     UUID,
        is_active   BOOLEAN NOT NULL DEFAULT true,
        sort_order  INTEGER NOT NULL DEFAULT 0,
        starts_at   TIMESTAMPTZ,
        ends_at     TIMESTAMPTZ,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE nav_items (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        label       VARCHAR(100) NOT NULL,
        url         VARCHAR(500),
        type        VARCHAR(50) NOT NULL,
        ref_id      UUID,
        parent_id   UUID REFERENCES nav_items(id) ON DELETE CASCADE,
        is_active   BOOLEAN NOT NULL DEFAULT true,
        show_in_nav BOOLEAN NOT NULL DEFAULT true,
        sort_order  INTEGER NOT NULL DEFAULT 0,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_nav_items_parent_id ON nav_items(parent_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS nav_items`);
    await queryRunner.query(`DROP TABLE IF EXISTS banners`);
  }
}
