import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppBlog, AppBlogExtended } from '../../../../types/blogs';
import { BlogsModelData } from '../blogs.model.types';
import { BlogsModel } from './blogs.model';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(BlogsModel.name)
    private readonly blogsModel: Model<BlogsModel>,
  ) {}

  private buildBlog(dataBlog: BlogsModelData): AppBlog {
    return {
      id: dataBlog._id.toString(),
      name: dataBlog.name,
      description: dataBlog.description,
      websiteUrl: dataBlog.websiteUrl,
      isMembership: dataBlog.isMembership,
      createdAt: dataBlog.createdAt,
    };
  }

  private buildExtendedBlog(dataBlog: BlogsModelData): AppBlogExtended {
    return {
      ...this.buildBlog(dataBlog),
      blogOwnerInfo: dataBlog.blogOwnerInfo,
      banInfo: dataBlog.banInfo,
    };
  }

  public async create(
    blogModelData: Omit<BlogsModelData, '_id'>,
  ): Promise<AppBlog> {
    const dbBlog = await this.blogsModel.create(blogModelData);

    return this.buildBlog(dbBlog);
  }

  public async findById(id: string): Promise<AppBlog | null> {
    const dbBlog = await this.blogsModel
      .findOne({
        _id: id,
        'banInfo.isBanned': { $ne: true },
      })
      .exec();

    return dbBlog && this.buildBlog(dbBlog);
  }

  public async findByIdExtended(id: string): Promise<AppBlogExtended | null> {
    const dbBlog = await this.blogsModel.findOne({ _id: id }).exec();

    return dbBlog && this.buildExtendedBlog(dbBlog);
  }

  public async updateById(
    id: string,
    blogModelData: Omit<BlogsModelData, '_id'>,
  ): Promise<AppBlog | null> {
    const dbBlog = await this.blogsModel
      .findByIdAndUpdate(id, blogModelData, { new: true })
      .exec();

    return dbBlog && this.buildBlog(dbBlog);
  }

  public async deleteById(id: string): Promise<number> {
    return (await this.blogsModel.deleteOne({ _id: id })).deletedCount;
  }

  public async deleteAll(): Promise<number> {
    return (await this.blogsModel.deleteMany()).deletedCount;
  }
}
