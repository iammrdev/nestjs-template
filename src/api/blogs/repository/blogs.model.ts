import { Document, Types, now, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

type BlogOwnerInfo = {
  userId: string;
  userLogin: string;
};

export type DataBlog = {
  _id: Types.ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  blogOwnerInfo?: BlogOwnerInfo;
  createdAt: Date;
};

@Schema({ collection: 'blogs' })
export class BlogsModel extends Document implements Omit<DataBlog, '_id'> {
  @Prop({ required: true })
  public name: string;

  @Prop({ required: true })
  public description: string;

  @Prop({ required: true })
  public websiteUrl: string;

  @Prop({ required: true })
  public isMembership: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed })
  public blogOwnerInfo: BlogOwnerInfo;

  @Prop({ default: now() })
  createdAt: Date;
}

export const BlogsSchema = SchemaFactory.createForClass(BlogsModel);
