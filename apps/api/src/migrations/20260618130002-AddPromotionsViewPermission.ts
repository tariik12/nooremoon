import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPromotionsViewPermission20260618130002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO permissions (key, label, "group", description)
      VALUES ('promotions.view', 'View Promotions', 'Marketing', 'View promotions and flash sales list')
      ON CONFLICT (key) DO NOTHING
    `);
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.name = 'admin' AND p.key = 'promotions.view'
        ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM permissions WHERE key = 'promotions.view'`);
  }
}
