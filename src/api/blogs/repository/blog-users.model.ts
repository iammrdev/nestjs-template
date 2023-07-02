import { Document, Types, now, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BanInfo = {
  isBanned: boolean;
  banReason: string | null;
  banDate: Date | null;
};

export type DataBlogUser = {
  _id: Types.ObjectId;
  userId: string;
  userLogin: string;
  banInfo: BanInfo;
  blogId: string;
};

@Schema({ collection: 'blog_users' })
export class BlogUsersModel
  extends Document
  implements Omit<DataBlogUser, '_id'>
{
  @Prop({ required: true })
  public userId: string;

  @Prop({ required: true })
  public userLogin: string;

  @Prop({ required: true })
  public blogId: string;

  @Prop({
    type: MongooseSchema.Types.Mixed,
    default: { isBanned: false, banDate: null },
  })
  public banInfo: BanInfo;

  @Prop({ default: now() })
  public createdAt: Date;
}

export const BlogUsersSchema = SchemaFactory.createForClass(BlogUsersModel);
