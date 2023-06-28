import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DataToken, TokensModel } from './tokens.model';
import { Token } from '../../../types/tokens';
import { RefreshTokenEntity } from '../service/auth.service.interface';

@Injectable()
export class TokensRepository {
  constructor(
    @InjectModel(TokensModel.name)
    private readonly tokensModel: Model<TokensModel>,
  ) {}

  private buildToken(dbToken: DataToken): Token {
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

  public async create(tokensEntity: RefreshTokenEntity): Promise<Token> {
    const dbToken = await this.tokensModel.create(tokensEntity);

    return this.buildToken(dbToken);
  }

  public async findById(id: string): Promise<Token | null> {
    const dbToken = await this.tokensModel.findOne({ _id: id }).exec();

    return dbToken && this.buildToken(dbToken);
  }

  public async findByUserId(userId: string): Promise<Token | null> {
    const dbToken = await this.tokensModel.findOne({ userId }).exec();

    return dbToken && this.buildToken(dbToken);
  }

  public async findByDeviceId(deviceId: string): Promise<Token | null> {
    const dbToken = await this.tokensModel.findOne({ deviceId }).exec();

    return dbToken && this.buildToken(dbToken);
  }

  public async findAllByUserId(userId: string): Promise<Token[]> {
    const dbTokens = await this.tokensModel.find({ userId }).exec();

    return dbTokens.map((dbToken) => this.buildToken(dbToken));
  }

  public async findByToken(refreshToken: string): Promise<Token | null> {
    const dbToken = await this.tokensModel.findOne({ refreshToken }).exec();

    return dbToken && this.buildToken(dbToken);
  }

  public async updateById(
    id: string,
    tokensEntity: RefreshTokenEntity,
  ): Promise<Token | null> {
    const dbToken = await this.tokensModel
      .findByIdAndUpdate(id, tokensEntity, { new: true })
      .exec();

    return dbToken && this.buildToken(dbToken);
  }

  public async deleteById(id: string): Promise<number> {
    return (await this.tokensModel.deleteOne({ _id: id })).deletedCount;
  }

  public async deleteByUser(userId: string, deviceId: string): Promise<number> {
    return (
      await this.tokensModel.deleteMany({
        $and: [{ userId }, { deviceId: { $ne: deviceId } }],
      })
    ).deletedCount;
  }

  public async deleteAll(): Promise<number> {
    return (await this.tokensModel.deleteMany()).deletedCount;
  }
}
