import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSupportEmail20260622000002 implements MigrationInterface {
  name = 'UpdateSupportEmail20260622000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO app_settings (key, value, is_public, description)
      VALUES ('support_email', 'support@nooremoon.com', true, 'Customer support email address')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO app_settings (key, value, is_public, description)
      VALUES ('support_email', 'support@nooremoon.global', true, 'Customer support email address')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `);
  }
}
