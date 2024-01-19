import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1705703365354 implements MigrationInterface {
    name = 'Auto1705703365354'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "blogs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying COLLATE "C" NOT NULL, "description" character varying COLLATE "C" NOT NULL, "websiteUrl" character varying COLLATE "C" NOT NULL, "isMembership" boolean NOT NULL, "blogOwnerInfoUserId" character varying, "blogOwnerInfoUserLogin" character varying COLLATE "C", "banInfoIsBanned" boolean NOT NULL DEFAULT false, "banInfoBanDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_e113335f11c926da929a625f118" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "blogs"`);
    }

}
