import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikesInfo, PostsModelData, Status } from './posts.model.types';

@Schema({ collection: 'posts' })
export class PostsModel
  extends Document
  implements Omit<PostsModelData, '_id'>
{
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

  @Prop()
  public authorId: string;

  @Prop({ required: true })
  public status: Status;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  public likesInfo: LikesInfo;

  @Prop({ required: true })
  public createdAt: Date;
}

export const PostsSchema = SchemaFactory.createForClass(PostsModel);
