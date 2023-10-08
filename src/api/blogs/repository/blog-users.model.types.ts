import { Types } from 'mongoose';

export type BanInfo = {
  isBanned: boolean;
  banReason: string | null;
  banDate: Date | null;
};

export type BlogUsersModelData = {
  _id: Types.ObjectId;
  userId: string;
  userLogin: string;
  banInfo: BanInfo;
  blogId: string;
};
