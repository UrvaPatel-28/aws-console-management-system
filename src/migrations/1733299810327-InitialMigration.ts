import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1733299810327 implements MigrationInterface {
  name = 'InitialMigration1733299810327';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."permission_enum" AS ENUM('Create Aws Credentials', 'Update Aws Credentials', 'Delete Aws Credentials', 'View Aws Credentials', 'View Audit Logs', 'Manage Role And Permissions')`,
    );
    await queryRunner.query(
      `CREATE TABLE "permission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" "public"."permission_enum" NOT NULL, CONSTRAINT "UQ_permission_name" UNIQUE ("name"), CONSTRAINT "PK_permission_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."role_enum" AS ENUM('Admin', 'Team Member', 'Team Leader', 'Auditor', 'Access Manager')`,
    );
    await queryRunner.query(
      `CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" "public"."role_enum" NOT NULL, CONSTRAINT "UQ_role_name" UNIQUE ("name"), CONSTRAINT "PK_role_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(70) NOT NULL, "password_hash" character varying(300) NOT NULL, "email" character varying(200) NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "UQ_user_email" UNIQUE ("email"), CONSTRAINT "UQ_user_username" UNIQUE ("username"), CONSTRAINT "PK_user_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "api_endpoint" character varying(500), "http_method" character varying(10), "request_payload" json, "response" json, "response_status" integer, "response_message" character varying(500), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_agent" character varying(255), "ip_address" character varying(45), "execution_duration" double precision, "user_id" uuid, CONSTRAINT "PK_audit_log_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "aws_console_credentials" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "aws_username" character varying(50) NOT NULL, "aws_password" character varying(100) NOT NULL, "expiration_time" TIMESTAMP, "created_by" uuid NOT NULL, "updated_by" uuid, CONSTRAINT "PK_aws_console_credentials_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_aws_console_credentials_aws_username" ON "aws_console_credentials" ("aws_username") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."aws_access_keys_status_enum" AS ENUM('Active', 'Inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "aws_programmatic_credentials" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "aws_username" character varying(50) NOT NULL, "aws_access_key" character varying(50) NOT NULL, "aws_secret_key" character varying(100) NOT NULL, "status" "public"."aws_access_keys_status_enum" NOT NULL, "created_by" uuid NOT NULL, "updated_by" uuid, CONSTRAINT "PK_aws_programmatic_credentials_id" PRIMARY KEY ("id"))`,
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
      `ALTER TABLE "user" ADD CONSTRAINT "FK_user_role_id" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_log" ADD CONSTRAINT "FK_audit_log_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "aws_console_credentials" ADD CONSTRAINT "FK_aws_console_credentials_created_by" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "aws_console_credentials" ADD CONSTRAINT "FK_aws_console_credentials_updated_by" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "aws_programmatic_credentials" ADD CONSTRAINT "FK_aws_programmatic_credentials_created_by" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "aws_programmatic_credentials" ADD CONSTRAINT "FK_aws_programmatic_credentials_updated_by" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "aws_programmatic_credentials" DROP CONSTRAINT "FK_aws_programmatic_credentials_updated_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "aws_programmatic_credentials" DROP CONSTRAINT "FK_aws_programmatic_credentials_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "aws_console_credentials" DROP CONSTRAINT "FK_aws_console_credentials_updated_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "aws_console_credentials" DROP CONSTRAINT "FK_aws_console_credentials_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_log" DROP CONSTRAINT "FK_audit_log_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_user_role_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_60070a9927cef9f3987b6fe174"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f2e23da3efc50030b43a3014a1"`,
    );
    await queryRunner.query(`DROP TABLE "role_permission_link"`);
    await queryRunner.query(`DROP TABLE "aws_programmatic_credentials"`);
    await queryRunner.query(`DROP TYPE "public"."aws_access_keys_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."UQ_aws_console_credentials_aws_username"`,
    );
    await queryRunner.query(`DROP TABLE "aws_console_credentials"`);
    await queryRunner.query(`DROP TABLE "audit_log"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TYPE "public"."role_enum"`);
    await queryRunner.query(`DROP TABLE "permission"`);
    await queryRunner.query(`DROP TYPE "public"."permission_enum"`);
  }
}
