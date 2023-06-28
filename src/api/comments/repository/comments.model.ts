import { Document, Schema as MongooseSchema, Types, now } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

type LikesInfo = {
  dislikes: string[];
  likes: string[];
};

type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

export type CommentRepo = {
  _id: Types.ObjectId;
  postId: string;
  content: string;
  likesInfo: LikesInfo;
  commentatorInfo: CommentatorInfo;
  status: 'active' | 'hidden';
  createdAt: Date;
};

@Schema({ collection: 'comments' })
export class CommentsModel
  extends Document
  implements Omit<CommentRepo, '_id'>
{
  @Prop({ required: true })
  public postId: string;

  @Prop({ required: true })
  public content: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  public commentatorInfo: CommentatorInfo;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  public likesInfo: LikesInfo;

  @Prop()
  public status: 'active' | 'hidden';

  @Prop({ default: now() })
  createdAt: Date;
}

export const CommentsSchema = SchemaFactory.createForClass(CommentsModel);
