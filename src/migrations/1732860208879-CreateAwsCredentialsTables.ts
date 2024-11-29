import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAwsCredentialsTables1732860208879
  implements MigrationInterface
{
  name = 'CreateAwsCredentialsTables1732860208879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "aws_console_credentials" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "aws_username" character varying(50) NOT NULL, "aws_password" character varying(100) NOT NULL, "expiration_time" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "PK_aws_console_credentials_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "aws_programmatic_credentials" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "aws_access_key" character varying(50) NOT NULL, "aws_secret_key" character varying(100) NOT NULL, "expiration_time" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "PK_aws_programmatic_credentials_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "aws_console_credentials" ADD CONSTRAINT "FK_aws_console_credentials_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "aws_programmatic_credentials" ADD CONSTRAINT "FK_aws_programmatic_credentials_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "aws_programmatic_credentials" DROP CONSTRAINT "FK_aws_programmatic_credentials_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "aws_console_credentials" DROP CONSTRAINT "FK_aws_console_credentials_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "aws_programmatic_credentials"`);
    await queryRunner.query(`DROP TABLE "aws_console_credentials"`);
  }
}
