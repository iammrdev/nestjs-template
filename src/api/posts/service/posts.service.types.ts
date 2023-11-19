import { LikeStatus } from '../../../types/likes';

export type CreatePostParams = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
};

export type UpdatePostParams = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
};

export type UserData = { id: string; login: string };

export type UpdatePostLikeStatusParams = {
  likeStatus: LikeStatus;
};

export type GetPostsQuery = {
  sortBy: string;
  sortDirection: 'desc' | 'asc';
  pageNumber: number;
  pageSize: number;
};
