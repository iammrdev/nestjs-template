import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetBlogUsersQuery } from './blogs.repository.interfece';
import { Pagination } from '../../../core/pagination';
import { BanInfo, BlogUsersModel, DataBlogUser } from './blog-users.model';

interface BlogUserEntity {
  userId: string;
  userLogin: string;
  blogId: string;
  banInfo: BanInfo;
}

const SORT_BY_MAP = {
  id: 'userId',
  login: 'userLogin',
};

@Injectable()
export class BlogUsersRepository {
  constructor(
    @InjectModel(BlogUsersModel.name)
    private readonly blogUsersModel: Model<BlogUsersModel>,
  ) {}

  private buildBlogUser(dataBlogUser: DataBlogUser) {
    return {
      id: dataBlogUser.userId,
      login: dataBlogUser.userLogin,
      banInfo: dataBlogUser.banInfo,
    };
  }

  public async create(blogUser: BlogUserEntity) {
    const dbBlog = await this.blogUsersModel.findOneAndUpdate(
      { userId: blogUser.userId },
      blogUser,
      { upsert: true },
    );

    return dbBlog && this.buildBlogUser(dbBlog);
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

  public async findUserByBlog(blogId: string, userId: string) {
    const dbBlog = await this.blogUsersModel.findOne({ userId, blogId }).exec();

    return dbBlog && this.buildBlogUser(dbBlog);
  }

  public async updateByUserId(userId: string, blogUserEntity: BlogUserEntity) {
    const dbBlog = await this.blogUsersModel
      .findOneAndUpdate({ userId }, blogUserEntity, { new: true })
      .exec();

    return dbBlog && this.buildBlogUser(dbBlog);
  }

  public async updateByBlogId(blogId: string, blogUserEntity: BlogUserEntity) {
    const dbBlog = await this.blogUsersModel
      .findOneAndUpdate({ blogId }, blogUserEntity, { new: true })
      .exec();

    return dbBlog && this.buildBlogUser(dbBlog);
  }
}
