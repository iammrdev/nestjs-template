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
  _id: Types.ObjectId | string;
  login: string;
  passwordHash: string;
  email: string;
  createdAt: Date;
  banInfo: BanInfo;
  confirmation: Confirmation;
};

export type UsersSQLModelData = {
  id: string;
  login: string;
  passwordHash: string;
  email: string;
  createdAt: Date;
  banInfoIsBanned: BanInfo['isBanned'];
  banInfoBanDate: BanInfo['banDate'];
  banInfoBanReason: BanInfo['banReason'];
  confirmationStatus: Confirmation['status'];
  confirmationCode: Confirmation['code'];
  confirmationExpiration: Confirmation['expiration'];
  confirmationActivation: Confirmation['activation'];
};
