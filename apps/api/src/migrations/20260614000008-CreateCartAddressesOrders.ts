import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCartAddressesOrders20260614000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE addresses (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        full_name     VARCHAR(200) NOT NULL,
        phone         VARCHAR(50),
        address_line1 VARCHAR(500) NOT NULL,
        address_line2 VARCHAR(500),
        city          VARCHAR(100) NOT NULL,
        state         VARCHAR(100),
        postal_code   VARCHAR(20),
        country       VARCHAR(100) NOT NULL,
        is_default    BOOLEAN NOT NULL DEFAULT false,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_addresses_user_id ON addresses(user_id)`);

    await queryRunner.query(`
      CREATE TABLE payment_gateways (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key         VARCHAR(50) NOT NULL UNIQUE,
        label       VARCHAR(100) NOT NULL,
        is_active   BOOLEAN NOT NULL DEFAULT false,
        sort_order  INTEGER NOT NULL DEFAULT 0,
        config      JSONB,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE carts (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
        session_id  VARCHAR(255),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_carts_user_id ON carts(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_carts_session_id ON carts(session_id)`);

    await queryRunner.query(`
      CREATE TABLE cart_items (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cart_id             UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
        product_variant_id  UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
        quantity            INTEGER NOT NULL,
        unit_price_cents    INTEGER NOT NULL,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id)`);

    await queryRunner.query(`
      CREATE TABLE orders (
        id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number                VARCHAR(50) NOT NULL UNIQUE,
        user_id                     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        shipping_address_id         UUID REFERENCES addresses(id) ON DELETE SET NULL,
        status                      VARCHAR(50) NOT NULL DEFAULT 'pending',
        payment_method              VARCHAR(20),
        payment_status              VARCHAR(20) NOT NULL DEFAULT 'pending',
        subtotal_cents              INTEGER NOT NULL,
        shipping_cents              INTEGER NOT NULL DEFAULT 0,
        discount_cents              INTEGER NOT NULL DEFAULT 0,
        gift_card_applied_cents     INTEGER NOT NULL DEFAULT 0,
        total_cents                 INTEGER NOT NULL,
        currency                    VARCHAR(10) NOT NULL DEFAULT 'USD',
        stripe_payment_intent_id    VARCHAR(255),
        bkash_payment_id            VARCHAR(255),
        eps_transaction_id          VARCHAR(255),
        tracking_number             VARCHAR(255),
        courier_name                VARCHAR(100),
        service_centre_confirmed_at TIMESTAMPTZ,
        cancellation_window_open    BOOLEAN NOT NULL DEFAULT true,
        notes                       TEXT,
        created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_orders_user_id ON orders(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_orders_status ON orders(status)`);
    await queryRunner.query(`CREATE INDEX idx_orders_order_number ON orders(order_number)`);

    await queryRunner.query(`
      CREATE TABLE order_items (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_variant_id  UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
        product_name        VARCHAR(300) NOT NULL,
        size                VARCHAR(20) NOT NULL,
        colour              VARCHAR(100),
        sku                 VARCHAR(100) NOT NULL,
        quantity            INTEGER NOT NULL,
        unit_price_cents    INTEGER NOT NULL,
        total_cents         INTEGER NOT NULL,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_order_items_order_id ON order_items(order_id)`);

    await queryRunner.query(`
      CREATE TABLE order_status_history (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        from_status VARCHAR(50),
        to_status   VARCHAR(50) NOT NULL,
        changed_by  UUID REFERENCES users(id) ON DELETE SET NULL,
        note        TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS order_status_history`);
    await queryRunner.query(`DROP TABLE IF EXISTS order_items`);
    await queryRunner.query(`DROP TABLE IF EXISTS orders`);
    await queryRunner.query(`DROP TABLE IF EXISTS cart_items`);
    await queryRunner.query(`DROP TABLE IF EXISTS carts`);
    await queryRunner.query(`DROP TABLE IF EXISTS payment_gateways`);
    await queryRunner.query(`DROP TABLE IF EXISTS addresses`);
  }
}
