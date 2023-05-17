import { Document, Types, now } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type DataUser = {
  _id: Types.ObjectId;
  login: string;
  passwordHash: string;
  email: string;
  createdAt: Date;
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
  createdAt: Date;
}

export const UsersSchema = SchemaFactory.createForClass(UsersModel);
