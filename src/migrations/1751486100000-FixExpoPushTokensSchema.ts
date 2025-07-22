import { MigrationInterface, QueryRunner } from "typeorm";

export class FixExpoPushTokensSchema1751486100000 implements MigrationInterface {
    name = 'FixExpoPushTokensSchema1751486100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop table if exists and recreate with correct schema
        await queryRunner.query(`DROP TABLE IF EXISTS "expo_push_tokens"`);

        // Create expo_push_tokens table with correct schema
        await queryRunner.query(`
            CREATE TABLE "expo_push_tokens" (
                "id" SERIAL NOT NULL,
                "token" character varying(255) NOT NULL,
                "user_id" character varying(50),
                "device_info" json,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "last_used_at" TIMESTAMP,
                CONSTRAINT "PK_expo_push_tokens_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_expo_push_tokens_token" UNIQUE ("token")
            )
        `);

        // Create index on token
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_expo_push_tokens_token" ON "expo_push_tokens" ("token")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_expo_push_tokens_token"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "expo_push_tokens"`);
    }
}
