import { Document, Schema as MongooseSchema, Types, now } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

type LikeAction = {
  addedAt: Date;
  login: string;
  userId: string;
};

type ExtendedLikesInfo = {
  dislikes: LikeAction[];
  likes: LikeAction[];
};

export type PostRepo = {
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
export class PostsModel extends Document implements Omit<PostRepo, '_id'> {
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

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  public extendedLikesInfo: ExtendedLikesInfo;

  @Prop({ default: now() })
  createdAt: Date;
}

export const PostsSchema = SchemaFactory.createForClass(PostsModel);
