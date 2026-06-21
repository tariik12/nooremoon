import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoriesSubCategoriesTiers20260614000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE categories (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name             VARCHAR(200) NOT NULL UNIQUE,
        slug             VARCHAR(200) NOT NULL UNIQUE,
        description      TEXT,
        hero_image_url   VARCHAR(500),
        nav_image_url    VARCHAR(500),
        icon_url         VARCHAR(500),
        is_active        BOOLEAN NOT NULL DEFAULT true,
        show_in_nav      BOOLEAN NOT NULL DEFAULT true,
        sort_order       INTEGER NOT NULL DEFAULT 0,
        meta_title       VARCHAR(255),
        meta_description VARCHAR(500),
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE sub_categories (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_id      UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        name             VARCHAR(200) NOT NULL,
        slug             VARCHAR(200) NOT NULL UNIQUE,
        description      TEXT,
        hero_image_url   VARCHAR(500),
        is_active        BOOLEAN NOT NULL DEFAULT true,
        show_in_nav      BOOLEAN NOT NULL DEFAULT true,
        sort_order       INTEGER NOT NULL DEFAULT 0,
        meta_title       VARCHAR(255),
        meta_description VARCHAR(500),
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_sub_categories_category_id ON sub_categories(category_id)`);

    await queryRunner.query(`
      CREATE TABLE tiers (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(100) NOT NULL UNIQUE,
        slug        VARCHAR(100) NOT NULL UNIQUE,
        description VARCHAR(500),
        sort_order  INTEGER NOT NULL DEFAULT 0,
        is_active   BOOLEAN NOT NULL DEFAULT true,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE sub_category_tiers (
        sub_category_id UUID NOT NULL REFERENCES sub_categories(id) ON DELETE CASCADE,
        tier_id         UUID NOT NULL REFERENCES tiers(id) ON DELETE CASCADE,
        PRIMARY KEY (sub_category_id, tier_id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS sub_category_tiers`);
    await queryRunner.query(`DROP TABLE IF EXISTS tiers`);
    await queryRunner.query(`DROP TABLE IF EXISTS sub_categories`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories`);
  }
}
