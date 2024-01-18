import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1705667191646 implements MigrationInterface {
    name = 'Auto1705667191646'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "ip" character varying NOT NULL, "deviceId" character varying NOT NULL, "title" character varying NOT NULL, "refreshToken" character varying NOT NULL, "iat" TIMESTAMP NOT NULL, "exp" TIMESTAMP NOT NULL, CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "login" character varying COLLATE "C" NOT NULL, "email" character varying COLLATE "C" NOT NULL, "passwordHash" character varying COLLATE "C" NOT NULL, "confirmationStatus" boolean NOT NULL, "confirmationCode" character varying NOT NULL, "confirmationExpiration" TIMESTAMP NOT NULL, "confirmationActivation" TIMESTAMP, "banInfoIsBanned" boolean NOT NULL, "banInfoBanDate" TIMESTAMP, "banInfoBanReason" character varying, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "recovery" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "ip" character varying NOT NULL, "deviceId" character varying NOT NULL, "title" character varying NOT NULL, "code" character varying NOT NULL, "iat" TIMESTAMP NOT NULL, "exp" TIMESTAMP NOT NULL, CONSTRAINT "PK_47b2530af2d597ff1b210847140" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "recovery"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "tokens"`);
    }

}
