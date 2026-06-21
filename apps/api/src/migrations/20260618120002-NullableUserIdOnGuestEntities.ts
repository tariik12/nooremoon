import { MigrationInterface, QueryRunner } from 'typeorm';

export class NullableUserIdOnGuestEntities20260618120002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE addresses ALTER COLUMN user_id DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE orders   ALTER COLUMN user_id DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE addresses ALTER COLUMN user_id SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE orders   ALTER COLUMN user_id SET NOT NULL`);
  }
}
