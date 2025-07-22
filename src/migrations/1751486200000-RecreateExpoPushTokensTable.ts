import { MigrationInterface, QueryRunner } from "typeorm";

export class RecreateExpoPushTokensTable1751486200000 implements MigrationInterface {
    name = 'RecreateExpoPushTokensTable1751486200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop table completely first 
        await queryRunner.query(`DROP TABLE IF EXISTS "expo_push_tokens" CASCADE`);

        // Recreate table with correct schema
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
                CONSTRAINT "PK_expo_push_tokens_id" PRIMARY KEY ("id")
            )
        `);

        // Create unique index on token
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_expo_push_tokens_token" ON "expo_push_tokens" ("token")
        `);

        // Add unique constraint on token
        await queryRunner.query(`
            ALTER TABLE "expo_push_tokens" ADD CONSTRAINT "UQ_expo_push_tokens_token" UNIQUE ("token")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "expo_push_tokens" CASCADE`);
    }
}
