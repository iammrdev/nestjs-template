import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyObject, Model } from 'mongoose';
import { CRUDRepository } from '../../../interfaces/crud-repository.interface';
import { BlogsEntity } from '../service/blogs.entity';
import { BlogsModel, DatabaseBlog } from './blogs.model';
import { Blog } from '../../../types/blogs';
import { BanInfo, GetBlogsParams } from './blogs.repository.interfece';
import { Pagination } from '../../../core/pagination';
import { PaginationList } from '../../../types/common';

type FindAllByUserReturnType<T> = T extends GetBlogsParams
  ? PaginationList<Blog[]>
  : Blog[];

@Injectable()
export class BlogsRepository
  implements CRUDRepository<BlogsEntity, string, Blog>
{
  constructor(
    @InjectModel(BlogsModel.name)
    private readonly blogsModel: Model<BlogsModel>,
  ) {}

  private buildBlog(dataBlog: DatabaseBlog) {
    return {
      id: dataBlog._id.toString(),
      name: dataBlog.name,
      description: dataBlog.description,
      websiteUrl: dataBlog.websiteUrl,
      isMembership: dataBlog.isMembership,
      createdAt: dataBlog.createdAt,
    };
  }

  private buildExtendedBlog(dataBlog: DatabaseBlog) {
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

    const pagination = new Pagination<DatabaseBlog>({
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

  public async create(blogsEntity: BlogsEntity): Promise<Blog> {
    const dbBlog = await this.blogsModel.create(blogsEntity.toObject());

    return this.buildBlog(dbBlog);
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
  ): Promise<PaginationList<Blog[]>> {
    const filter = this.buildPaginationFilter(params);

    const pagination = await this.buildPagination(params, filter);

    return pagination.toView(this.buildExtendedBlog.bind(this));
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

  public async findById(id: string): Promise<Blog | null> {
    const dbBlog = await this.blogsModel
      .findOne({
        _id: id,
        'banInfo.isBanned': { $ne: true },
      })
      .exec();

    return dbBlog && this.buildBlog(dbBlog);
  }

  public async findByIdExtended(id: string): Promise<Blog | null> {
    const dbBlog = await this.blogsModel.findOne({ _id: id }).exec();

    return dbBlog && this.buildExtendedBlog.bind(this)(dbBlog);
  }

  public async updateById(
    id: string,
    blogsEntity: BlogsEntity,
  ): Promise<Blog | null> {
    const dbBlog = await this.blogsModel
      .findByIdAndUpdate(id, blogsEntity.toObject(), { new: true })
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
