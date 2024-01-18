import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyObject, Model } from 'mongoose';
import { TokensModel } from './tokens.model';
import { AppToken } from '../../../../types/tokens';
import { TokensModelData } from '../tokens.model.types';

@Injectable()
export class TokensMongoDBRepository {
  constructor(
    @InjectModel(TokensModel.name)
    private readonly tokensModel: Model<TokensModel>,
  ) {}

  private buildToken(dbToken: TokensModelData): AppToken {
    return {
      id: dbToken._id.toString(),
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
    tokensModelData: Omit<TokensModelData, '_id'>,
  ): Promise<AppToken> {
    const dbToken = await this.tokensModel.create(tokensModelData);

    return this.buildToken(dbToken);
  }

  public async findByDeviceId(deviceId: string): Promise<AppToken | null> {
    const dbToken = await this.tokensModel.findOne({ deviceId }).exec();

    return dbToken && this.buildToken(dbToken);
  }

  public async findAllByUserId(userId: string): Promise<AppToken[]> {
    const dbTokens = await this.tokensModel.find({ userId }).exec();

    return dbTokens.map((dbToken) => this.buildToken(dbToken));
  }

  public async findByToken(refreshToken: string): Promise<AppToken | null> {
    const dbToken = await this.tokensModel.findOne({ refreshToken }).exec();

    return dbToken && this.buildToken(dbToken);
  }

  public async deleteById(id: string): Promise<void> {
    await this.tokensModel.deleteOne({ _id: id });
  }

  public async deleteByUser(
    userId: string,
    deviceId?: string,
  ): Promise<number> {
    const filter: AnyObject[] = [{ userId }];

    if (deviceId) {
      filter.push({ deviceId: { $ne: deviceId } });
    }

    return (await this.tokensModel.deleteMany({ $and: filter })).deletedCount;
  }

  public async deleteAll(): Promise<number> {
    return (await this.tokensModel.deleteMany()).deletedCount;
  }
}
