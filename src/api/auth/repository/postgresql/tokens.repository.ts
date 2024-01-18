import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TokensModelData } from '../tokens.model.types';
import { AppToken } from '../../../../types/tokens';

@Injectable()
export class TokensSQLRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private buildToken(dbToken: TokensModelData): AppToken {
    return {
      id: dbToken.id,
      userId: dbToken.userId,
      ip: dbToken.ip,
      deviceId: dbToken.deviceId,
      title: dbToken.title,
      refreshToken: dbToken.refreshToken,
      iat: dbToken.iat,
      exp: dbToken.exp,
    };
  }

  public async create(
    tokensModelData: Omit<TokensModelData, 'id'>,
  ): Promise<AppToken> {
    const values = [
      tokensModelData.userId,
      tokensModelData.ip,
      tokensModelData.deviceId,
      tokensModelData.title,
      tokensModelData.refreshToken,
      tokensModelData.iat,
      tokensModelData.exp,
    ];
    const dbToken = await this.dataSource.query(
      `
    INSERT INTO tokens (
      "userId",
      "ip",
      "deviceId",
      "title",
      "refreshToken",
      "iat",
      "exp"
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `,
      values,
    );

    return this.buildToken(dbToken);
  }

  public async findByDeviceId(deviceId: string): Promise<AppToken | null> {
    const [dbToken] = await this.dataSource.query(
      `SELECT * FROM tokens WHERE "deviceId"=$1 LIMIT 1`,
      [deviceId],
    );

    return dbToken && this.buildToken(dbToken);
  }

  public async findAllByUserId(userId: string): Promise<AppToken[]> {
    const dbTokens = await this.dataSource.query(
      `SELECT * FROM tokens WHERE "userId"=$1`,
      [userId],
    );

    return dbTokens.map((dbToken) => this.buildToken(dbToken));
  }

  public async findByToken(refreshToken: string): Promise<AppToken | null> {
    const [dbToken] = await this.dataSource.query(
      `SELECT * FROM tokens WHERE "refreshToken" = $1 LIMIT 1`,
      [refreshToken],
    );

    return dbToken && this.buildToken(dbToken);
  }

  public async deleteById(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM tokens WHERE id=$1`, [id]);
  }

  public async deleteByUser(
    userId: string,
    deviceId?: string,
  ): Promise<number> {
    if (!deviceId) {
      return this.dataSource.query(`DELETE FROM tokens WHERE "userId"=$1`, [
        userId,
      ]);
    }
    return this.dataSource.query(
      `DELETE FROM tokens WHERE "userId"=$1 AND "deviceId" != $2`,
      [userId, deviceId],
    );
  }

  public async deleteAll(): Promise<void> {
    await this.dataSource.query(`DELETE FROM tokens`);
  }
}
