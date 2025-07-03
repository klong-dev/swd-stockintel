import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNews1751485817312 implements MigrationInterface {
    name = 'AddNews1751485817312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "news" ("newsId" SERIAL NOT NULL, "author" character varying(100) NOT NULL, "title" character varying(255) NOT NULL, "content" text NOT NULL, "sourceUrl" character varying(255), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "tagTagId" integer, CONSTRAINT "PK_b5589be2edde9e2a404d413c35b" PRIMARY KEY ("newsId"))`);
        await queryRunner.query(`ALTER TABLE "report" DROP CONSTRAINT "FK_c6686efa4cd49fa9a429f01bac8"`);
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "report" ADD "user_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "comment" ADD "user_id" character varying`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_61e65eb4e5c6a3b198f2ab924e9"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "expert_id"`);
        await queryRunner.query(`ALTER TABLE "post" ADD "expert_id" character varying`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "user_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_758b8ce7c18b9d347461b30228d"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "user_id" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY ("user_id")`);
        await queryRunner.query(`ALTER TABLE "report" ADD CONSTRAINT "FK_c6686efa4cd49fa9a429f01bac8" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "news" ADD CONSTRAINT "FK_cc26b370f2da009bcde9128315b" FOREIGN KEY ("tagTagId") REFERENCES "tag"("tag_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_61e65eb4e5c6a3b198f2ab924e9" FOREIGN KEY ("expert_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_61e65eb4e5c6a3b198f2ab924e9"`);
        await queryRunner.query(`ALTER TABLE "news" DROP CONSTRAINT "FK_cc26b370f2da009bcde9128315b"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7"`);
        await queryRunner.query(`ALTER TABLE "report" DROP CONSTRAINT "FK_c6686efa4cd49fa9a429f01bac8"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_758b8ce7c18b9d347461b30228d"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "user_id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY ("user_id")`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "user_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "expert_id"`);
        await queryRunner.query(`ALTER TABLE "post" ADD "expert_id" integer`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_61e65eb4e5c6a3b198f2ab924e9" FOREIGN KEY ("expert_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "comment" ADD "user_id" integer`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "report" ADD "user_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "report" ADD CONSTRAINT "FK_c6686efa4cd49fa9a429f01bac8" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE "news"`);
    }

}
