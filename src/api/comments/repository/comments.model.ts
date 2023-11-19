import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  CommentatorInfo,
  CommentsModelData,
  LikesInfo,
  Status,
} from './comments.model.types';

@Schema({ collection: 'comments' })
export class CommentsModel
  extends Document
  implements Omit<CommentsModelData, '_id'>
{
  @Prop({ required: true })
  public postId: string;

  @Prop({ required: true })
  public content: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  public commentatorInfo: CommentatorInfo;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  public likesInfo: LikesInfo;

  @Prop({ required: true })
  public status: Status;

  @Prop({ required: true })
  createdAt: Date;
}

export const CommentsSchema = SchemaFactory.createForClass(CommentsModel);
