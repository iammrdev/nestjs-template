import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BanInfo, BlogsModelData, BlogOwnerInfo } from './blogs.model.types';

@Schema({ collection: 'blogs' })
export class BlogsModel
  extends Document
  implements Omit<BlogsModelData, '_id'>
{
  @Prop({ required: true })
  public name: string;

  @Prop({ required: true })
  public description: string;

  @Prop({ required: true })
  public websiteUrl: string;

  @Prop({ required: true })
  public isMembership: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  public blogOwnerInfo: BlogOwnerInfo;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  public banInfo: BanInfo;

  @Prop({ required: true })
  public createdAt: Date;
}

export const BlogsSchema = SchemaFactory.createForClass(BlogsModel);
