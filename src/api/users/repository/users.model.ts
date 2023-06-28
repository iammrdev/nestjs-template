import { Document, Schema as MongooseSchema, Types, now } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

type Confirmation = {
  status: boolean;
  code: string;
  expiration: Date;
  activation: Date | null;
};

type BanInfo = {
  isBanned: boolean;
  banDate: Date | null;
  banReason: string | null;
};

export type DataUser = {
  _id: Types.ObjectId;
  login: string;
  passwordHash: string;
  email: string;
  createdAt: Date;
  banInfo: BanInfo;
  confirmation: Confirmation;
};

@Schema({ collection: 'users' })
export class UsersModel extends Document implements Omit<DataUser, '_id'> {
  @Prop({ required: true })
  public login: string;

  @Prop({ required: true })
  public email: string;

  @Prop({ required: true })
  public passwordHash: string;

  @Prop({ default: now() })
  public createdAt: Date;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  public confirmation: Confirmation;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  public banInfo: BanInfo;
}

export const UsersSchema = SchemaFactory.createForClass(UsersModel);
