import { LikeStatus } from './likes';

export type Comment = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  likesInfo: {
    dislikesCount: number;
    likesCount: number;
    myStatus: LikeStatus;
  };
  createdAt: Date;
};
