import { PaginationList } from '../../types/common';

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

type User = {
  id: string;
  login: string;
  email: string;
  banInfo: BanInfo;
  confirmation: Confirmation;
  createdAt: Date;
};

type BlogOwnerInfo = {
  userId: string;
  userLogin: string;
};

type Blog = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
  banInfo: Omit<BanInfo, 'banReason'>;
  blogOwnerInfo: BlogOwnerInfo | null;
};

export type PostUsersRdo = User;

export type GetUsersRdo = PaginationList<Omit<User, 'confirmation'>[]>;

export type GetBlogsRdo = PaginationList<Blog[]>;
