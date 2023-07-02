import { Document, Types, now, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

type BlogOwnerInfo = {
  userId: string;
  userLogin: string;
};

type BanInfo = {
  isBanned: boolean;
  banDate: Date | null;
};

type BannedUser = {
  id: string;
  login: string;
  banInfo: BanInfo;
};

export type DatabaseBlog = {
  _id: Types.ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  blogOwnerInfo?: BlogOwnerInfo;
  bannedUsers?: BannedUser[];
  banInfo?: BanInfo;
  createdAt: Date;
};

@Schema({ collection: 'blogs' })
export class BlogsModel extends Document implements Omit<DatabaseBlog, '_id'> {
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

  @Prop({ type: MongooseSchema.Types.Mixed })
  public bannedUsers: BannedUser[];

  @Prop({
    type: MongooseSchema.Types.Mixed,
    default: { isBanned: false, banDate: null },
  })
  public banInfo: BanInfo;

  @Prop({ default: now() })
  public createdAt: Date;
}

export const BlogsSchema = SchemaFactory.createForClass(BlogsModel);
