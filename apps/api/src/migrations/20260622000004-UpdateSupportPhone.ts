import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSupportPhone20260622000004 implements MigrationInterface {
  name = 'UpdateSupportPhone20260622000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO app_settings (key, value, is_public, description)
      VALUES ('support_phone', '09644441441', true, 'Customer support phone number')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO app_settings (key, value, is_public, description)
      VALUES ('support_phone', '09666774577', true, 'Customer support phone number')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `);
  }
}
