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

type User = {
  id: string;
  login: string;
  banInfo: {
    isBanned: boolean;
    banReason: string | null;
    banDate: Date | null;
  };
};

type Blog = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
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

type Comment = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };
  createdAt: Date;
  postInfo:
    | {
        id: string;
        title: string;
        blogId: string;
        blogName: string;
      }
    | undefined;
};

export type PostBlogsRdo = Blog;

export type GetBlogsRdo = PaginationList<Blog[]>;

export type GetPostsByBlogIdRdo = PaginationList<Post[]>;

export type GetCommentsRdo = PaginationList<Comment[]>;

export type GetUsersByBlogRdo = PaginationList<User[]>;

export type PutPostByBlogRdo = Post;

export type PostPostsByBlogIdRdo = Post;
