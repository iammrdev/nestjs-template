import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DataToken, TokensModel } from './tokens.model';
import { TokensEntity } from './tokens.entity';
import { Token } from '../../../types/tokens';

@Injectable()
export class TokensRepository {
  constructor(
    @InjectModel(TokensModel.name)
    private readonly tokensModel: Model<TokensModel>,
  ) {}

  private buildToken(dbToken: DataToken) {
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

  public async create(tokensEntity: any): Promise<Token> {
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

  public async findByToken(refreshToken: string): Promise<Token | null> {
    const dbToken = await this.tokensModel.findOne({ refreshToken }).exec();

    return dbToken && this.buildToken(dbToken);
  }

  public async updateById(
    id: string,
    tokensEntity: TokensEntity,
  ): Promise<Token | null> {
    const dbToken = await this.tokensModel
      .findByIdAndUpdate(id, tokensEntity.toObject(), { new: true })
      .exec();

    return dbToken && this.buildToken(dbToken);
  }

  public async deleteById(id: string): Promise<number> {
    return (await this.tokensModel.deleteOne({ _id: id })).deletedCount;
  }

  public async deleteAll(): Promise<number> {
    return (await this.tokensModel.deleteMany()).deletedCount;
  }
}
