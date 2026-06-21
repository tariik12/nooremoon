import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCmsAndStoreLocations20260614000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE cms_pages (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug             VARCHAR(200) NOT NULL UNIQUE,
        title            VARCHAR(255) NOT NULL,
        content          TEXT,
        meta_title       VARCHAR(255),
        meta_description VARCHAR(500),
        is_published     BOOLEAN NOT NULL DEFAULT false,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE store_locations (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name          VARCHAR(200) NOT NULL,
        address       TEXT,
        city          VARCHAR(100),
        country       VARCHAR(100),
        phone         VARCHAR(50),
        email         VARCHAR(100),
        opening_hours JSONB,
        lat           DECIMAL(10,7),
        lng           DECIMAL(10,7),
        is_active     BOOLEAN NOT NULL DEFAULT true,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE app_settings (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key         VARCHAR(200) NOT NULL UNIQUE,
        value       TEXT,
        is_public   BOOLEAN NOT NULL DEFAULT false,
        description VARCHAR(255),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE email_templates (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key         VARCHAR(100) NOT NULL UNIQUE,
        subject     VARCHAR(255) NOT NULL,
        html_body   TEXT NOT NULL,
        text_body   TEXT,
        is_active   BOOLEAN NOT NULL DEFAULT true,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS email_templates`);
    await queryRunner.query(`DROP TABLE IF EXISTS app_settings`);
    await queryRunner.query(`DROP TABLE IF EXISTS store_locations`);
    await queryRunner.query(`DROP TABLE IF EXISTS cms_pages`);
  }
}
