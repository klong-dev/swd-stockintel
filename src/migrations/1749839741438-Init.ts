import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1749839741438 implements MigrationInterface {
    name = 'Init1749839741438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "stock_crawl_data" ("crawl_id" SERIAL NOT NULL, "stock_id" integer NOT NULL, "crawl_date" date NOT NULL, "volume" bigint, "ref_price" numeric(10,2), "ceil_price" numeric(10,2), "floor_price" numeric(10,2), "open_price" numeric(10,2), "high_price" numeric(10,2), "low_price" numeric(10,2), "foreign_buy_volume" bigint, "foreign_sell_volume" bigint, "foreign_buy_value" numeric(15,2), "foreign_sell_value" numeric(15,2), "foreign_room_left_percent" numeric(5,2), "eps_basic" numeric(10,2), "eps_diluted" numeric(10,2), "pe" numeric(10,2), "book_value" numeric(10,2), "pb" numeric(10,2), "created_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_fde2652094282d7d5dde00f3a33" PRIMARY KEY ("crawl_id"))`);
        await queryRunner.query(`CREATE TABLE "report" ("report_id" SERIAL NOT NULL, "post_id" integer, "comment_id" integer, "user_id" integer NOT NULL, "reason" character varying(255) NOT NULL, "status" character varying(50), "created_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_1bdd9ab86f1a920d365961cb28c" PRIMARY KEY ("report_id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("comment_id" SERIAL NOT NULL, "post_id" integer, "user_id" integer, "parent_comment_id" integer, "content" text NOT NULL, "is_edited" boolean DEFAULT false, "like_count" integer, "created_at" TIMESTAMP DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_6a9f9bf1cf9a09107d3224a0e9a" PRIMARY KEY ("comment_id"))`);
        await queryRunner.query(`CREATE TABLE "notification" ("notification_id" SERIAL NOT NULL, "user_id" integer NOT NULL, "type" character varying(50) NOT NULL, "related_id" integer, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_fc4db99eb33f32cea47c5b6a39c" PRIMARY KEY ("notification_id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("user_id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "provider" character varying(50), "password_hash" character varying(255), "full_name" character varying(100), "avatar_url" character varying(255), "social_id" character varying(100), "status" character varying(50), "is_expert" boolean DEFAULT false, "created_at" TIMESTAMP DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "post" ("post_id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "content" text, "expert_id" integer, "stock_id" integer, "source_url" character varying(255), "view_count" integer, "session" integer NOT NULL, "like_count" integer, "created_at" TIMESTAMP DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_4d093caee4d33b2745c7d05a41d" PRIMARY KEY ("post_id"))`);
        await queryRunner.query(`CREATE TABLE "stock" ("stock_id" SERIAL NOT NULL, "symbol" character varying(10) NOT NULL, "company_name" character varying(100) NOT NULL, "stock_exchange_id" integer, CONSTRAINT "PK_535f28fb720127de0997a5a866e" PRIMARY KEY ("stock_id"))`);
        await queryRunner.query(`CREATE TABLE "stock_exchange" ("stock_exchange_id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "PK_40a55d2212ecdcfa10f2ff05655" PRIMARY KEY ("stock_exchange_id"))`);
        await queryRunner.query(`CREATE TABLE "ai_analysis" ("analysis_id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "content" text NOT NULL, "confidence_score" numeric(5,2), "created_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_ec62e1402db6e252b93bc4e5e6e" PRIMARY KEY ("analysis_id"))`);
        await queryRunner.query(`CREATE TABLE "admin" ("id" character varying(255) NOT NULL, "username" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "status" integer NOT NULL, CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "stock_crawl_data" ADD CONSTRAINT "FK_f3a17bf9aec5a18e71dd567985d" FOREIGN KEY ("stock_id") REFERENCES "stock"("stock_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report" ADD CONSTRAINT "FK_265b3dc7c7f692f016115d46a29" FOREIGN KEY ("post_id") REFERENCES "post"("post_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report" ADD CONSTRAINT "FK_8bb2bc4a3d9c55e031bc5d015c5" FOREIGN KEY ("comment_id") REFERENCES "comment"("comment_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report" ADD CONSTRAINT "FK_c6686efa4cd49fa9a429f01bac8" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_8aa21186314ce53c5b61a0e8c93" FOREIGN KEY ("post_id") REFERENCES "post"("post_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_ac69bddf8202b7c0752d9dc8f32" FOREIGN KEY ("parent_comment_id") REFERENCES "comment"("comment_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_61e65eb4e5c6a3b198f2ab924e9" FOREIGN KEY ("expert_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_8022cccda15e9de33bf0af16002" FOREIGN KEY ("stock_id") REFERENCES "stock"("stock_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock" ADD CONSTRAINT "FK_7fc33232e75a4c23413851127bd" FOREIGN KEY ("stock_exchange_id") REFERENCES "stock_exchange"("stock_exchange_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stock" DROP CONSTRAINT "FK_7fc33232e75a4c23413851127bd"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_8022cccda15e9de33bf0af16002"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_61e65eb4e5c6a3b198f2ab924e9"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_ac69bddf8202b7c0752d9dc8f32"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_8aa21186314ce53c5b61a0e8c93"`);
        await queryRunner.query(`ALTER TABLE "report" DROP CONSTRAINT "FK_c6686efa4cd49fa9a429f01bac8"`);
        await queryRunner.query(`ALTER TABLE "report" DROP CONSTRAINT "FK_8bb2bc4a3d9c55e031bc5d015c5"`);
        await queryRunner.query(`ALTER TABLE "report" DROP CONSTRAINT "FK_265b3dc7c7f692f016115d46a29"`);
        await queryRunner.query(`ALTER TABLE "stock_crawl_data" DROP CONSTRAINT "FK_f3a17bf9aec5a18e71dd567985d"`);
        await queryRunner.query(`DROP TABLE "admin"`);
        await queryRunner.query(`DROP TABLE "ai_analysis"`);
        await queryRunner.query(`DROP TABLE "stock_exchange"`);
        await queryRunner.query(`DROP TABLE "stock"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "report"`);
        await queryRunner.query(`DROP TABLE "stock_crawl_data"`);
    }

}
