import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1705707706602 implements MigrationInterface {
    name = 'Auto1705707706602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying COLLATE "C" NOT NULL, "shortDescription" character varying COLLATE "C" NOT NULL, "content" character varying COLLATE "C" NOT NULL, "blogId" character varying NOT NULL, "blogName" character varying COLLATE "C" NOT NULL, "authorId" character varying NOT NULL, "status" character varying COLLATE "C" NOT NULL, "likesInfoLikes" character varying, "likesInfoDislikes" character varying, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "posts"`);
    }

}
