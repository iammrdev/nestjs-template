import { Types } from 'mongoose';

export interface RecoveryModelData {
  _id: Types.ObjectId;
  userId: string;
  deviceId: string;
  ip: string;
  title: string;
  code: string;
  iat: Date;
  exp: Date;
}
