import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSaleNavItem20260622000005 implements MigrationInterface {
  name = 'RemoveSaleNavItem20260622000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM nav_items WHERE label = 'Sale'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO nav_items (label, url, position, is_active, parent_id)
      VALUES ('Sale', '/sale', 4, true, NULL)
      ON CONFLICT DO NOTHING
    `);
  }
}
