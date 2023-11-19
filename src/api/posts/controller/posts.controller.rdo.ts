import { PaginationList } from '../../../types/common';
import { LikeStatus } from '../../../types/likes';

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

export type PostRdo = Post;

export type GetRdo = PaginationList<Post[]>;

export type GetByIdRdo = Post;

export type PutLikeStatusByIdRdo = Post;

export type PostCommentsByIdRdo = Comment;

export type GetCommentsByIdRdo = PaginationList<Comment[]>;
