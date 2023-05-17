import { Document, Schema as MongooseSchema, Types, now } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeInfo, LikeStatus } from '../../../types/likes';

type ExtendedLikesInfo = {
  dislikesCount: number;
  likesCount: number;
  myStatus: LikeStatus;
  newestLikes: LikeInfo[];
};

export type DataPost = {
  _id: Types.ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfo;
};

@Schema({ collection: 'posts' })
export class PostsModel extends Document implements Omit<DataPost, '_id'> {
  @Prop({ required: true })
  public title: string;

  @Prop({ required: true })
  public shortDescription: string;

  @Prop({ required: true })
  public content: string;

  @Prop({ required: true })
  public blogId: string;

  @Prop({ required: true })
  public blogName: string;

  @Prop({ type: MongooseSchema.Types.Map, required: true })
  public extendedLikesInfo: ExtendedLikesInfo;

  @Prop({ default: now() })
  createdAt: Date;
}

export const PostsSchema = SchemaFactory.createForClass(PostsModel);
