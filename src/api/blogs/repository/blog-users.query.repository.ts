import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pagination } from '../../../core/pagination';
import { BlogUsersModel } from './blog-users.model';
import { GetBlogUsersQuery } from './blog-users.query.repository.types';
import { BlogUsersModelData } from './blog-users.model.types';

const SORT_BY_MAP = {
  id: 'userId',
  login: 'userLogin',
};

@Injectable()
export class BlogUsersQueryRepository {
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

  public async findAllUsersByBlog(blogId: string, params: GetBlogUsersQuery) {
    const filter = { blogId, 'banInfo.isBanned': params.isBanned };

    if (params.searchLoginTerm) {
      Object.assign(filter, { login: RegExp(params.searchLoginTerm, 'i') });
    }
    const totalCount = await this.blogUsersModel.countDocuments(filter).exec();

    const pagination = new Pagination({
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });

    const sortBy = SORT_BY_MAP[params.sortBy] || params.sortBy;

    const dbBlogs = await this.blogUsersModel
      .find(filter)
      .sort({ [sortBy]: params.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .exec();

    return pagination.setItems(dbBlogs.map(this.buildBlogUser)).toView();
  }
}
