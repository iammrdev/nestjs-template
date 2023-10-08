import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogUsersModel } from './blog-users.model';
import { BlogUsersModelData } from './blog-users.model.types';

@Injectable()
export class BlogUsersRepository {
  constructor(
    @InjectModel(BlogUsersModel.name)
    private readonly blogUsersModel: Model<BlogUsersModel>,
  ) {}

  private buildBlogUser(dataBlogUser: BlogUsersModelData) {
    return {
      id: dataBlogUser.userId,
      login: dataBlogUser.userLogin,
      banInfo: dataBlogUser.banInfo,
    };
  }

  public async create(blogUserData: Omit<BlogUsersModelData, '_id'>) {
    const dbBlog = await this.blogUsersModel.findOneAndUpdate(
      { userId: blogUserData.userId },
      blogUserData,
      { upsert: true },
    );

    return dbBlog && this.buildBlogUser(dbBlog);
  }

  public async findUserByBlog(blogId: string, userId: string) {
    const dbBlog = await this.blogUsersModel.findOne({ userId, blogId }).exec();

    return dbBlog && this.buildBlogUser(dbBlog);
  }

  public async updateByUserId(
    userId: string,
    blogUserData: BlogUsersModelData,
  ) {
    const dbBlog = await this.blogUsersModel
      .findOneAndUpdate({ userId }, blogUserData, { new: true })
      .exec();

    return dbBlog && this.buildBlogUser(dbBlog);
  }

  public async updateByBlogId(
    blogId: string,
    blogUserData: BlogUsersModelData,
  ) {
    const dbBlog = await this.blogUsersModel
      .findOneAndUpdate({ blogId }, blogUserData, { new: true })
      .exec();

    return dbBlog && this.buildBlogUser(dbBlog);
  }
}
