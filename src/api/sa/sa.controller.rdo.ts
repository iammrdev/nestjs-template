import { LikeStatus } from '../../types/likes';
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

type LikeAction = {
  addedAt: Date;
  login: string;
  userId: string;
};

type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: LikeAction[];
};

type Post = {
  id: string;
  title: string;
  shortDescription: string;
  blogId: string;
  blogName: string;
  content: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfo;
};

export type PostUsersRdo = Omit<User, 'confirmation' | 'banInfo'>;

export type GetUsersRdo = PaginationList<
  Omit<User, 'confirmation' | 'banInfo'>[]
>;

export type PostBlogsRdo = Omit<Blog, 'banInfo' | 'blogOwnerInfo'>;

export type GetBlogsRdo = PaginationList<Blog[]>;

export type GetPostsByBlogIdRdo = PaginationList<Post[]>;

export type PostPostsByBlogIdRdo = Post;
