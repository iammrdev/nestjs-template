import { Document, Types, now } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type DataBlog = {
  _id: Types.ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
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

  @Prop({ default: now() })
  createdAt: Date;
}

export const BlogsSchema = SchemaFactory.createForClass(BlogsModel);
