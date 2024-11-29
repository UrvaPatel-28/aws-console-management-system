import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailColumnInUser1732851759348 implements MigrationInterface {
  name = 'AddEmailColumnInUser1732851759348';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "email" character varying(200) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_user_email" UNIQUE ("email")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_user_email"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "email"`);
  }
}
