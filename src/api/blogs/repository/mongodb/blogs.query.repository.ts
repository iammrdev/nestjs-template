import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyObject, Model } from 'mongoose';
import { AppBlog, AppBlogExtended } from '../../../../types/blogs';
import { Pagination } from '../../../../core/pagination';
import { BlogsModelData } from '../blogs.model.types';
import {
  FindAllBlogsByUserResponse,
  FindAllBlogsByUserWithPaginationResponse,
  FindAllBlogsExtendedResponse,
  FindAllBlogsParams,
  FindAllBlogsResponse,
} from '../blogs.query.repository.types';
import { BlogsModel } from './blogs.model';

@Injectable()
export class BlogsQueryRepository {
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

  private buildPaginationFilter(
    params: FindAllBlogsParams,
  ): Record<string, any> {
    if (!params.searchNameTerm) {
      return {};
    }

    return { name: RegExp(params.searchNameTerm, 'i') };
  }

  private async buildPagination(
    paginationParams: {
      pageNumber: number;
      pageSize: number;
      sortBy: string;
      sortDirection: 'asc' | 'desc';
    },
    filter: AnyObject,
  ): Promise<Pagination<BlogsModelData>> {
    const totalCount = await this.blogsModel.countDocuments(filter).exec();

    const pagination = new Pagination<BlogsModelData>({
      page: paginationParams.pageNumber,
      pageSize: paginationParams.pageSize,
      totalCount,
    });

    const dbBlogs = await this.blogsModel
      .find(filter)
      .sort({ [paginationParams.sortBy]: paginationParams.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .exec();

    pagination.setItems(dbBlogs);

    return pagination;
  }

  public async findAllBlogs(
    params: FindAllBlogsParams,
  ): Promise<FindAllBlogsResponse> {
    const filter = this.buildPaginationFilter(params);

    Object.assign(filter, { 'banInfo.isBanned': { $ne: true } });

    const pagination = await this.buildPagination(params, filter);

    return pagination.toView(this.buildBlog);
  }

  public async findAllBlogsExtended(
    params: FindAllBlogsParams,
  ): Promise<FindAllBlogsExtendedResponse> {
    const filter = this.buildPaginationFilter(params);

    const pagination = await this.buildPagination(params, filter);

    return pagination.toView(this.buildExtendedBlog.bind(this));
  }

  public async findAllBlogsByUser(
    userId: string,
  ): Promise<FindAllBlogsByUserResponse> {
    const filter = { 'blogOwnerInfo.userId': userId };

    const dbBlogs = await this.blogsModel.find(filter).exec();

    return dbBlogs.map(this.buildBlog);
  }

  public async findAllByUserWithPagination(
    userId: string,
    params: FindAllBlogsParams,
  ): Promise<FindAllBlogsByUserWithPaginationResponse> {
    const filter = { 'blogOwnerInfo.userId': userId };
    const paginationFilter = this.buildPaginationFilter(params);

    Object.assign(filter, paginationFilter);

    const pagination = await this.buildPagination(params, filter);

    return pagination.toView(this.buildBlog);
  }
}
