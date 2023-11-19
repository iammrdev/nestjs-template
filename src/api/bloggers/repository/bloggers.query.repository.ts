import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pagination } from '../../../core/pagination';
import { BloggersModel } from './bloggers.model';
import {
  FindAllUsersByBlogResponse,
  GetBloggersQuery,
} from './bloggers.query.repository.types';
import { BloggersModelData } from './bloggers.model.types';
import { AppBlogger } from '../../../types/blogger';

const SORT_BY_MAP = {
  id: 'userId',
  login: 'userLogin',
};

@Injectable()
export class BloggersQueryRepository {
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

  public async findAllUsersByBlog(
    blogId: string,
    params: GetBloggersQuery,
  ): Promise<FindAllUsersByBlogResponse> {
    const filter = { blogId, 'banInfo.isBanned': params.isBanned };

    if (params.searchLoginTerm) {
      Object.assign(filter, { login: RegExp(params.searchLoginTerm, 'i') });
    }
    const totalCount = await this.bloggersModel.countDocuments(filter).exec();

    const pagination = new Pagination({
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });

    const sortBy = SORT_BY_MAP[params.sortBy] || params.sortBy;

    const dbBlogs = await this.bloggersModel
      .find(filter)
      .sort({ [sortBy]: params.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .exec();

    return pagination.setItems(dbBlogs.map(this.buildBlogUser)).toView();
  }
}
