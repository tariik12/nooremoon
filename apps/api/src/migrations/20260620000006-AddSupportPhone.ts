import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSupportPhone20260620000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO app_settings (key, value, is_public, description) VALUES
        ('support_phone',       '09666774577',               true, 'Customer support phone number'),
        ('support_hours',       '09:00 AM – 06:00 PM',       true, 'Customer support available hours'),
        ('support_phone_label', 'Call Us',                   true, 'Label for phone on contact page')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM app_settings WHERE key IN ('support_phone','support_hours','support_phone_label')`);
  }
}
