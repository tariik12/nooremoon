import { MigrationInterface, QueryRunner } from 'typeorm';

export class WideOtpCodeColumn20260614000016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE otp_codes ALTER COLUMN code TYPE VARCHAR(255)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE otp_codes ALTER COLUMN code TYPE VARCHAR(10)`);
  }
}
