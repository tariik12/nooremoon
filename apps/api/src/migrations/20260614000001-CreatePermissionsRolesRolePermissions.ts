import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePermissionsRolesRolePermissions20260614000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE permissions (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key         VARCHAR(100) NOT NULL UNIQUE,
        label       VARCHAR(200) NOT NULL,
        "group"     VARCHAR(100) NOT NULL,
        description VARCHAR(500),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE roles (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(100) NOT NULL UNIQUE,
        label       VARCHAR(200) NOT NULL,
        description VARCHAR(500),
        is_active   BOOLEAN NOT NULL DEFAULT true,
        is_system   BOOLEAN NOT NULL DEFAULT false,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE role_permissions (
        role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        granted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        granted_by    UUID,
        PRIMARY KEY (role_id, permission_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS role_permissions`);
    await queryRunner.query(`DROP TABLE IF EXISTS roles`);
    await queryRunner.query(`DROP TABLE IF EXISTS permissions`);
  }
}
