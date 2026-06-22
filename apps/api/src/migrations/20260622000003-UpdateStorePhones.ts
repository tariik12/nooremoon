import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStorePhones20260622000003 implements MigrationInterface {
  name = 'UpdateStorePhones20260622000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE store_locations SET phone = '+880 9644 440 440'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore original placeholder numbers
    await queryRunner.query(`UPDATE store_locations SET phone = '+880 1900-000001' WHERE name LIKE '%Banani%'`);
    await queryRunner.query(`UPDATE store_locations SET phone = '+880 1900-000002' WHERE name LIKE '%Dhanmondi%'`);
    await queryRunner.query(`UPDATE store_locations SET phone = '+880 1900-000003' WHERE name LIKE '%Gulshan%'`);
    await queryRunner.query(`UPDATE store_locations SET phone = '+880 1900-000004' WHERE name LIKE '%Uttara%'`);
    await queryRunner.query(`UPDATE store_locations SET phone = '+880 1900-000005' WHERE name LIKE '%Chattogram%'`);
    await queryRunner.query(`UPDATE store_locations SET phone = '+880 1900-000006' WHERE name LIKE '%Sylhet%'`);
  }
}
