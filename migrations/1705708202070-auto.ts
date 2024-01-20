import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1705708202070 implements MigrationInterface {
    name = 'Auto1705708202070'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "authorId" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "authorId" SET NOT NULL`);
    }

}
