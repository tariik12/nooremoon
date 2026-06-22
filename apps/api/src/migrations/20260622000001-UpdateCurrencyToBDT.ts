import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCurrencyToBDT20260622000001 implements MigrationInterface {
  name = 'UpdateCurrencyToBDT20260622000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO app_settings (key, value, is_public, description) VALUES
        ('currency_code',               'BDT',                                          true,  'ISO 4217 currency code'),
        ('currency_symbol',             '৳',                                            true,  'Currency symbol shown in UI'),
        ('announcement_bar_text',       'Free shipping on orders over ৳1,500 · Shop the Eid Collection →', true, 'Scrolling announcement bar text'),
        ('shipping_flat_rate_cents',    '8000',                                         true,  'Flat shipping rate in paisa (8000 = ৳80)'),
        ('free_shipping_threshold_cents','150000',                                      true,  'Free shipping threshold in paisa (150000 = ৳1,500)')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO app_settings (key, value, is_public, description) VALUES
        ('currency_code',               'USD',                                          true,  'ISO 4217 currency code'),
        ('currency_symbol',             '$',                                            true,  'Currency symbol shown in UI'),
        ('announcement_bar_text',       'Free shipping on orders over $150 · Shop the Eid Collection →', true, 'Scrolling announcement bar text'),
        ('shipping_flat_rate_cents',    '1000',                                         true,  'Flat shipping rate in cents'),
        ('free_shipping_threshold_cents','15000',                                       true,  'Free shipping threshold in cents')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `);
  }
}
