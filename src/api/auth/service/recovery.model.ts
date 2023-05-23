import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface DataRecovery {
  _id: Types.ObjectId;
  userId: string;
  deviceId: string;
  ip: string;
  title: string;
  code: string;
  iat: Date;
  exp: Date;
}

@Schema({ collection: 'recovery' })
export class RecoveryModel
  extends Document
  implements Omit<DataRecovery, '_id'>
{
  @Prop({ required: true })
  public userId: string;

  @Prop({ required: true })
  public deviceId: string;

  @Prop({ required: true })
  public ip: string;

  @Prop({ required: true })
  public title: string;

  @Prop({ required: true })
  public code: string;

  @Prop({ required: true })
  public iat: Date;

  @Prop({ required: true })
  public exp: Date;
}

export const RecoverySchema = SchemaFactory.createForClass(RecoveryModel);
