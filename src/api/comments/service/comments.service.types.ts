import { LikeStatus } from '../../../types/likes';

export type GetCommentsParams = {
  sortBy: string;
  sortDirection: 'desc' | 'asc';
  pageNumber: number;
  pageSize: number;
};

export type CreateCommentParams = {
  content: string;
  userId: string;
  userLogin: string;
};

export type UpdateCommentParams = {
  content: string;
  userId: string;
};

export type UpdateCommentLikeStatusParams = {
  userId: string;
  likeStatus: LikeStatus;
};
