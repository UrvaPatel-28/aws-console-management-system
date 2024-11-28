import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1732795835931 implements MigrationInterface {
  name = 'InitialMigration1732795835931';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" "public"."role_enum" NOT NULL, CONSTRAINT "UQ_role_name" UNIQUE ("name"), CONSTRAINT "PK_role_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."permission_enum" AS ENUM('Create Aws Credentials', 'Update Aws Credentials', 'Delete Aws Credentials', 'View Audit Logs')`,
    );
    await queryRunner.query(
      `CREATE TABLE "permission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" "public"."permission_enum" NOT NULL, CONSTRAINT "UQ_permission_name" UNIQUE ("name"), CONSTRAINT "PK_permission_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(70) NOT NULL, "password_hash" character varying(300) NOT NULL, "team_leader_id" uuid, "role_id" uuid, CONSTRAINT "UQ_user_username" UNIQUE ("username"), CONSTRAINT "PK_user_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permission_link" ("role_id" uuid NOT NULL, "permission_id" uuid NOT NULL, CONSTRAINT "PK_405b69ca9f35929e3024b7dd093" PRIMARY KEY ("role_id", "permission_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f2e23da3efc50030b43a3014a1" ON "role_permission_link" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_60070a9927cef9f3987b6fe174" ON "role_permission_link" ("permission_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_user_team_leader_id" FOREIGN KEY ("team_leader_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_user_role_id" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission_link" ADD CONSTRAINT "FK_role_permission_link_role_id" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission_link" ADD CONSTRAINT "FK_role_permission_link_permission_id" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permission_link" DROP CONSTRAINT "FK_role_permission_link_permission_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission_link" DROP CONSTRAINT "FK_role_permission_link_role_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_user_role_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_user_team_leader_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_60070a9927cef9f3987b6fe174"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f2e23da3efc50030b43a3014a1"`,
    );
    await queryRunner.query(`DROP TABLE "role_permission_link"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "permission"`);
    await queryRunner.query(`DROP TYPE "public"."permission_enum"`);
    await queryRunner.query(`DROP TABLE "role"`);
  }
}
