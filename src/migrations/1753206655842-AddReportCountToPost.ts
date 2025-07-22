import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReportCountToPost1753206655842 implements MigrationInterface {
    name = 'AddReportCountToPost1753206655842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" ADD "report_count" integer DEFAULT '0'`);
        await queryRunner.query(`ALTER TYPE "public"."post_status_enum" RENAME TO "post_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."post_status_enum" AS ENUM('PENDING', 'ACTIVE', 'DELETED', 'BLOCKED')`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "status" TYPE "public"."post_status_enum" USING "status"::"text"::"public"."post_status_enum"`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'`);
        await queryRunner.query(`DROP TYPE "public"."post_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."post_status_enum_old" AS ENUM('PENDING', 'ACTIVE', 'DELETED', 'BLOCKED', 'REPORTED')`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "status" TYPE "public"."post_status_enum_old" USING "status"::"text"::"public"."post_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'`);
        await queryRunner.query(`DROP TYPE "public"."post_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."post_status_enum_old" RENAME TO "post_status_enum"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "report_count"`);
    }

}
