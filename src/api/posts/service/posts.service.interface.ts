import { LikeStatus } from '../../../types/likes';

export type CreatePostDto = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
};

export type UpdatePostDto = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
};

export type GetPostsQuery = {
  sortBy: string;
  sortDirection: 'desc' | 'asc';
  pageNumber: number;
  pageSize: number;
};

export type UserData = { id: string; login: string };

export type UpdatePostLikeStatusDto = {
  likeStatus: LikeStatus;
};
