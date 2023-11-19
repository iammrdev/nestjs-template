import { Types } from 'mongoose';

export type LikesInfo = {
  dislikes: string[];
  likes: string[];
};

export type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

export type Status = 'active' | 'hidden-by-ban';

export type CommentsModelData = {
  _id: Types.ObjectId;
  postId: string;
  content: string;
  likesInfo: LikesInfo;
  commentatorInfo: CommentatorInfo;
  status: Status;
  createdAt: Date;
};
