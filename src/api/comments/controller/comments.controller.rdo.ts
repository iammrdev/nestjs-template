import { LikeStatus } from '../../../types/likes';

type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

type Comment = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };
  createdAt: Date;
};

export type GetByIdRdo = Comment;

export type PutByIdRdo = Comment;

export type PutLikeStatusByIdRdo = Comment;
