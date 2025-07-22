import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotificationTables1753195951045 implements MigrationInterface {
    name = 'AddNotificationTables1753195951045'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "expo_push_tokens" ("id" SERIAL NOT NULL, "token" character varying(255) NOT NULL, "user_id" integer, "device_info" json, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "last_used_at" TIMESTAMP, CONSTRAINT "UQ_524f58de04d973fcbcd3680b273" UNIQUE ("token"), CONSTRAINT "PK_79207a44d5d6984c5ea65d482a0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_524f58de04d973fcbcd3680b27" ON "expo_push_tokens" ("token") `);
        await queryRunner.query(`ALTER TABLE "notification" ADD "title" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "body" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "data" json`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "expo_ticket_id" character varying(255)`);
        await queryRunner.query(`CREATE TYPE "public"."notification_delivery_status_enum" AS ENUM('pending', 'sent', 'delivered', 'failed')`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "delivery_status" "public"."notification_delivery_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8"`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8"`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "delivery_status"`);
        await queryRunner.query(`DROP TYPE "public"."notification_delivery_status_enum"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "expo_ticket_id"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "data"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "body"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "title"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_524f58de04d973fcbcd3680b27"`);
        await queryRunner.query(`DROP TABLE "expo_push_tokens"`);
    }

}
