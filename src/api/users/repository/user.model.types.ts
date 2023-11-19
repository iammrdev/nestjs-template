import { Types } from 'mongoose';

export type Confirmation = {
  status: boolean;
  code: string;
  expiration: Date;
  activation: Date | null;
};

export type BanInfo = {
  isBanned: boolean;
  banDate: Date | null;
  banReason: string | null;
};

export type UsersModelData = {
  _id: Types.ObjectId;
  login: string;
  passwordHash: string;
  email: string;
  createdAt: Date;
  banInfo: BanInfo;
  confirmation: Confirmation;
};
