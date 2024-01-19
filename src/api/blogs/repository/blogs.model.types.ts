import { Types } from 'mongoose';

export type BlogOwnerInfo = {
  userId: string;
  userLogin: string;
};

export type BanInfo = {
  isBanned: boolean;
  banDate: Date | null;
};

export type BannedUser = {
  id: string;
  login: string;
  banInfo: BanInfo;
};

export type BlogsModelData = {
  _id: Types.ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  blogOwnerInfo: BlogOwnerInfo | null;
  banInfo: BanInfo;
  createdAt: Date;
};

export type BlogsSQLModelData = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  blogOwnerInfoUserId: string | null;
  blogOwnerInfoUserLogin: string | null;
  banInfoIsBanned: boolean;
  banInfoBanDate: Date | null;
  createdAt: Date;
};
