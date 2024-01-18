import { Injectable } from '@nestjs/common';
import { RecoveryModelData } from '../recovery.model.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class RecoverySQLRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  public async create(
    recoveryModelData: Omit<RecoveryModelData, '_id'>,
  ): Promise<RecoveryModelData> {
    const values = [
      recoveryModelData.userId,
      recoveryModelData.ip,
      recoveryModelData.deviceId,
      recoveryModelData.title,
      recoveryModelData.code,
      recoveryModelData.iat,
      recoveryModelData.exp,
    ];
    const recovery = await this.dataSource.query(
      `
    INSERT INTO recovery (
      "userId",
      "ip",
      "deviceId",
      "title",
      "code",
      "iat",
      "exp"
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `,
      values,
    );
    return recovery;
  }

  public async findByCode(code: string): Promise<RecoveryModelData | null> {
    const [recovery] = await this.dataSource.query(
      `SELECT * FROM recovery WHERE code=$1 LIMIT 1`,
      [code],
    );

    return recovery;
  }

  public async deleteAll(): Promise<void> {
    await this.dataSource.query(`DELETE FROM recovery`);
  }
}
