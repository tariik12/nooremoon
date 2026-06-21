import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIvrFieldsToOrders20260618120001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS ivr_call_id  VARCHAR(255) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS ivr_status   VARCHAR(50)  DEFAULT 'not_triggered'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
        DROP COLUMN IF EXISTS ivr_call_id,
        DROP COLUMN IF EXISTS ivr_status
    `);
  }
}
