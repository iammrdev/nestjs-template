import { Types } from 'mongoose';

export type LikeAction = {
  addedAt: Date;
  login: string;
  userId: string;
};

export type LikesInfo = {
  dislikes: LikeAction[];
  likes: LikeAction[];
};

export type Status = 'active' | 'hidden-by-ban';

export type PostsModelData = {
  _id: Types.ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  likesInfo: LikesInfo;
  authorId?: string;
  status: Status;
};

export type PostsSQLModelData = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  likesInfoLikes: null;
  likesInfoDislikes: null;
  authorId?: string;
  status: Status;
};
