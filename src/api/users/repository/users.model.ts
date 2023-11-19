import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BanInfo, Confirmation, UsersModelData } from './user.model.types';

@Schema({ collection: 'users' })
export class UsersModel
  extends Document
  implements Omit<UsersModelData, '_id'>
{
  @Prop({ required: true })
  public login: string;

  @Prop({ required: true })
  public email: string;

  @Prop({ required: true })
  public passwordHash: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  public confirmation: Confirmation;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  public banInfo: BanInfo;

  @Prop({ required: true })
  public createdAt: Date;
}

export const UsersSchema = SchemaFactory.createForClass(UsersModel);
