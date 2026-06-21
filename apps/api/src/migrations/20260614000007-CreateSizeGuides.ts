import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSizeGuides20260614000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE size_guides (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        garment_type  VARCHAR(100) NOT NULL,
        style_fit     VARCHAR(100),
        gender        VARCHAR(20),
        unit          VARCHAR(5) NOT NULL DEFAULT 'cm',
        chart_data    JSONB NOT NULL,
        is_active     BOOLEAN NOT NULL DEFAULT true,
        sort_order    INTEGER NOT NULL DEFAULT 0,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS size_guides`);
  }
}
