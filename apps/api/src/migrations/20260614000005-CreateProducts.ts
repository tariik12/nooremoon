import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProducts20260614000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE products (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name                VARCHAR(300) NOT NULL,
        slug                VARCHAR(300) NOT NULL UNIQUE,
        description         TEXT,
        care_instructions   TEXT,
        category_id         UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        sub_category_id     UUID REFERENCES sub_categories(id) ON DELETE SET NULL,
        tier_id             UUID REFERENCES tiers(id) ON DELETE SET NULL,
        is_cottocool        BOOLEAN NOT NULL DEFAULT false,
        is_active           BOOLEAN NOT NULL DEFAULT true,
        is_flash_sale       BOOLEAN NOT NULL DEFAULT false,
        base_price_cents    INTEGER NOT NULL,
        discount_percent    INTEGER NOT NULL DEFAULT 0,
        final_price_cents   INTEGER NOT NULL,
        stock_total         INTEGER NOT NULL DEFAULT 0,
        low_stock_threshold INTEGER NOT NULL DEFAULT 5,
        meta_title          VARCHAR(255),
        meta_description    VARCHAR(500),
        created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at          TIMESTAMPTZ
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_products_category_id ON products(category_id)`);
    await queryRunner.query(`CREATE INDEX idx_products_sub_category_id ON products(sub_category_id)`);
    await queryRunner.query(`CREATE INDEX idx_products_tier_id ON products(tier_id)`);
    await queryRunner.query(`CREATE INDEX idx_products_slug ON products(slug)`);

    await queryRunner.query(`
      ALTER TABLE products ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
          to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,''))
        ) STORED
    `);
    await queryRunner.query(`CREATE INDEX idx_products_search_vector ON products USING GIN(search_vector)`);

    await queryRunner.query(`
      CREATE TABLE product_images (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        url         VARCHAR(500) NOT NULL,
        alt_text    VARCHAR(255),
        is_primary  BOOLEAN NOT NULL DEFAULT false,
        sort_order  INTEGER NOT NULL DEFAULT 0,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_product_images_product_id ON product_images(product_id)`);

    await queryRunner.query(`
      CREATE TABLE product_variants (
        id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id           UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        size                 VARCHAR(20) NOT NULL,
        colour               VARCHAR(100),
        colour_hex           VARCHAR(7),
        sku                  VARCHAR(100) NOT NULL UNIQUE,
        stock_qty            INTEGER NOT NULL DEFAULT 0,
        price_override_cents INTEGER,
        created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_product_variants_product_id ON product_variants(product_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS product_variants`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_images`);
    await queryRunner.query(`DROP TABLE IF EXISTS products`);
  }
}
