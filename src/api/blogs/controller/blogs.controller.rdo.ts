import { LikeStatus } from '../../../types/likes';
import { PaginationList } from '../../../types/common';

type Blog = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
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

export type Post = {
  id: string;
  title: string;
  shortDescription: string;
  blogId: string;
  blogName: string;
  content: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfo;
};

export type PostRdo = Blog;

export type GetRdo = PaginationList<Blog[]>;

export type GetByIdRdo = Blog;

export type GetPostsByIdRdo = PaginationList<Post[]>;

export type PostPostsByIdRdo = Post;
