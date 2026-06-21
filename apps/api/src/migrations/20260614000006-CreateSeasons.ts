import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSeasons20260614000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE seasons (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name            VARCHAR(200) NOT NULL,
        slug            VARCHAR(200) NOT NULL UNIQUE,
        nav_label       VARCHAR(100),
        hero_image_url  VARCHAR(500),
        description     TEXT,
        is_active       BOOLEAN NOT NULL DEFAULT true,
        show_in_nav     BOOLEAN NOT NULL DEFAULT true,
        starts_at       TIMESTAMPTZ,
        ends_at         TIMESTAMPTZ,
        archived_at     TIMESTAMPTZ,
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE season_sub_collections (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        season_id        UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
        label            VARCHAR(200) NOT NULL,
        category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
        sub_category_id  UUID REFERENCES sub_categories(id) ON DELETE SET NULL,
        hero_image_url   VARCHAR(500),
        sort_order       INTEGER NOT NULL DEFAULT 0,
        is_active        BOOLEAN NOT NULL DEFAULT true,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_season_sub_collections_season_id ON season_sub_collections(season_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS season_sub_collections`);
    await queryRunner.query(`DROP TABLE IF EXISTS seasons`);
  }
}
