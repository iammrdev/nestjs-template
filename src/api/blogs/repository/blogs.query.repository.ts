import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyObject, Model } from 'mongoose';
import { Blog, BlogExtended } from '../../../types/blogs';
import { Pagination } from '../../../core/pagination';
import { PaginationList } from '../../../types/common';
import { BlogsModelData } from './blogs.model.types';
import { GetBlogsParams } from './blogs.query.repository.types';
import { BlogsModel } from './blogs.model';

type FindAllByUserReturnType<T> = T extends GetBlogsParams
  ? PaginationList<Blog[]>
  : Blog[];

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(BlogsModel.name)
    private readonly blogsModel: Model<BlogsModel>,
  ) {}

  private buildBlog(dataBlog: BlogsModelData): Blog {
    return {
      id: dataBlog._id.toString(),
      name: dataBlog.name,
      description: dataBlog.description,
      websiteUrl: dataBlog.websiteUrl,
      isMembership: dataBlog.isMembership,
      createdAt: dataBlog.createdAt,
    };
  }

  private buildExtendedBlog(dataBlog: BlogsModelData): BlogExtended {
    return {
      ...this.buildBlog(dataBlog),
      blogOwnerInfo: dataBlog.blogOwnerInfo,
      banInfo: dataBlog.banInfo,
    };
  }

  private buildPaginationFilter(params: GetBlogsParams) {
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
  ) {
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

  public async findAll(
    params: GetBlogsParams,
  ): Promise<PaginationList<Blog[]>> {
    const filter = this.buildPaginationFilter(params);

    Object.assign(filter, { 'banInfo.isBanned': { $ne: true } });

    const pagination = await this.buildPagination(params, filter);

    return pagination.toView(this.buildBlog);
  }

  public async findAllExtended(
    params: GetBlogsParams,
  ): Promise<PaginationList<BlogExtended[]>> {
    const filter = this.buildPaginationFilter(params);

    const pagination = await this.buildPagination(params, filter);

    return pagination.toView(this.buildExtendedBlog.bind(this));
  }

  public async findAllByOwner(userId: string): Promise<Blog[]> {
    const filter = { 'blogOwnerInfo.userId': userId };

    const dbBlogs = await this.blogsModel.find(filter).exec();

    return dbBlogs.map(this.buildBlog);
  }

  public async findAllByUser<T extends GetBlogsParams | undefined = undefined>(
    userId: string,
    params?: T,
  ): Promise<FindAllByUserReturnType<T>> {
    const filter = { 'blogOwnerInfo.userId': userId };

    if (!params) {
      const dbBlogs = await this.blogsModel.find(filter).exec();

      return dbBlogs.map(this.buildBlog) as FindAllByUserReturnType<T>;
    }

    const paginationFilter = this.buildPaginationFilter(params);

    Object.assign(filter, paginationFilter);

    const pagination = await this.buildPagination(params, filter);

    return pagination.toView(this.buildBlog) as FindAllByUserReturnType<T>;
  }

  public async findAllByOwnerWithPagination(
    userId: string,
    params: GetBlogsParams,
  ): Promise<PaginationList<Blog[]>> {
    const filter = { 'blogOwnerInfo.userId': userId };
    const paginationFilter = this.buildPaginationFilter(params);

    Object.assign(filter, paginationFilter);

    const pagination = await this.buildPagination(params, filter);

    return pagination.toView(this.buildBlog);
  }
}
