import { Document, Schema as MongooseSchema, Types, now } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatus } from '../../../types/likes';

type LikesInfo = {
  dislikesCount: number;
  likesCount: number;
  myStatus: LikeStatus;
};

type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

export type DataComment = {
  _id: Types.ObjectId;
  content: string;
  likesInfo: LikesInfo;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
};

@Schema({ collection: 'comments' })
export class CommentsModel
  extends Document
  implements Omit<DataComment, '_id'>
{
  @Prop({ required: true })
  public content: string;

  @Prop({ type: MongooseSchema.Types.Map, required: true })
  public commentatorInfo: CommentatorInfo;

  @Prop({ type: MongooseSchema.Types.Map, required: true })
  public likesInfo: LikesInfo;

  @Prop({ default: now() })
  createdAt: Date;
}

export const CommentsSchema = SchemaFactory.createForClass(CommentsModel);
