import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TokensModelData } from './tokens.model.types';

@Schema({ collection: 'tokens' })
export class TokensModel
  extends Document
  implements Omit<TokensModelData, '_id'>
{
  @Prop({ required: true })
  public userId: string;

  @Prop({ required: true })
  public ip: string;

  @Prop({ required: true })
  public deviceId: string;

  @Prop({ required: true })
  public title: string;

  @Prop({ required: true })
  public refreshToken: string;

  @Prop({ required: true })
  public iat: Date;

  @Prop({ required: true })
  public exp: Date;
}

export const TokensSchema = SchemaFactory.createForClass(TokensModel);
