import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BanInfo, BloggersModelData } from './bloggers.model.types';

@Schema({ collection: 'blog_users' })
export class BloggersModel
  extends Document
  implements Omit<BloggersModelData, '_id'>
{
  @Prop({ required: true })
  public userId: string;

  @Prop({ required: true })
  public userLogin: string;

  @Prop({ required: true })
  public blogId: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  public banInfo: BanInfo;

  @Prop({ required: true })
  public createdAt: Date;
}

export const BloggersSchema = SchemaFactory.createForClass(BloggersModel);
