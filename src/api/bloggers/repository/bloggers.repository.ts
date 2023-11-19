import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BloggersModel } from './bloggers.model';
import { BloggersModelData } from './bloggers.model.types';
import { AppBlogger } from '../../../types/blogger';

@Injectable()
export class BloggersRepository {
  constructor(
    @InjectModel(BloggersModel.name)
    private readonly bloggersModel: Model<BloggersModel>,
  ) {}

  private buildBlogUser(bloggerData: BloggersModelData): AppBlogger {
    return {
      id: bloggerData.userId,
      login: bloggerData.userLogin,
      banInfo: bloggerData.banInfo,
    };
  }

  public async create(
    blogUserData: Omit<BloggersModelData, '_id'>,
  ): Promise<AppBlogger | null> {
    const dbBlog = await this.bloggersModel.findOneAndUpdate(
      { userId: blogUserData.userId },
      blogUserData,
      { upsert: true },
    );

    return dbBlog && this.buildBlogUser(dbBlog);
  }

  public async findUserByBlog(
    blogId: string,
    userId: string,
  ): Promise<AppBlogger | null> {
    const dbBlog = await this.bloggersModel.findOne({ userId, blogId }).exec();

    return dbBlog && this.buildBlogUser(dbBlog);
  }

  public async updateByUserId(
    userId: string,
    blogUserData: BloggersModelData,
  ): Promise<AppBlogger | null> {
    const dbBlog = await this.bloggersModel
      .findOneAndUpdate({ userId }, blogUserData, { new: true })
      .exec();

    return dbBlog && this.buildBlogUser(dbBlog);
  }

  public async updateByBlogId(
    blogId: string,
    blogUserData: BloggersModelData,
  ): Promise<AppBlogger | null> {
    const dbBlog = await this.bloggersModel
      .findOneAndUpdate({ blogId }, blogUserData, { new: true })
      .exec();

    return dbBlog && this.buildBlogUser(dbBlog);
  }
}
