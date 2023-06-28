import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyObject, Model } from 'mongoose';
import { CRUDRepository } from '../../../interfaces/crud-repository.interface';
import { BlogsEntity } from '../service/blogs.entity';
import { BlogsModel, DataBlog } from './blogs.model';
import { Blog } from '../../../types/blogs';
import { GetBlogsParams, UserData } from './blogs.repository.interfece';
import { Pagination } from '../../../core/pagination';
import { PaginationList } from '../../../types/common';

@Injectable()
export class BlogsRepository
  implements CRUDRepository<BlogsEntity, string, Blog>
{
  constructor(
    @InjectModel(BlogsModel.name)
    private readonly blogsModel: Model<BlogsModel>,
  ) {}

  private buildBlog(dataBlog: DataBlog) {
    return {
      id: dataBlog._id.toString(),
      name: dataBlog.name,
      description: dataBlog.description,
      websiteUrl: dataBlog.websiteUrl,
      isMembership: dataBlog.isMembership,
      createdAt: dataBlog.createdAt,
    };
  }

  private buildBlogWithOwnerInfo(dataBlog: DataBlog) {
    return {
      ...this.buildBlog(dataBlog),
      blogOwnerInfo: dataBlog.blogOwnerInfo,
    };
  }

  private getPaginationFilter(params: GetBlogsParams) {
    if (!params.searchNameTerm) {
      return {};
    }

    return { name: RegExp(params.searchNameTerm, 'i') };
  }

  public async create(blogsEntity: BlogsEntity): Promise<Blog> {
    const dbBlog = await this.blogsModel.create(blogsEntity.toObject());

    return this.buildBlog(dbBlog);
  }

  public async findAll(
    params: GetBlogsParams,
  ): Promise<PaginationList<Blog[]>> {
    const filter = this.getPaginationFilter(params);

    const totalCount = await this.blogsModel.countDocuments(filter).exec();

    const pagination = new Pagination<Blog>({
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });

    const dbBlogs = await this.blogsModel
      .find(filter)
      .sort({ [params.sortBy]: params.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .exec();

    return pagination.setItems(dbBlogs.map(this.buildBlog)).toView();
  }

  public async findAllByUser(
    user: UserData,
    params: GetBlogsParams,
  ): Promise<PaginationList<Blog[]>> {
    const paginationFilter = this.getPaginationFilter(params);

    const filter = Object.assign(paginationFilter, {
      'blogOwnerInfo.userId': user.id,
    });

    const totalCount = await this.blogsModel.countDocuments(filter).exec();

    const pagination = new Pagination<Blog>({
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });

    const dbBlogs = await this.blogsModel
      .find(filter)
      .sort({ [params.sortBy]: params.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .exec();

    return pagination.setItems(dbBlogs.map(this.buildBlog)).toView();
  }

  public async findAllWithOwnerInfo(
    params: GetBlogsParams,
  ): Promise<PaginationList<Blog[]>> {
    const filter = this.getPaginationFilter(params);

    const totalCount = await this.blogsModel.countDocuments(filter).exec();

    const pagination = new Pagination<Blog>({
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });

    const dbBlogs = await this.blogsModel
      .find(filter)
      .sort({ [params.sortBy]: params.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .exec();

    return pagination
      .setItems(dbBlogs.map(this.buildBlogWithOwnerInfo.bind(this)))
      .toView();
  }

  public async findById(id: string): Promise<Blog | null> {
    const dbBlog = await this.blogsModel.findOne({ _id: id }).exec();

    return dbBlog && this.buildBlog(dbBlog);
  }

  public async findByIdWithOwnerInfo(id: string): Promise<Blog | null> {
    const dbBlog = await this.blogsModel.findOne({ _id: id }).exec();

    return dbBlog && this.buildBlogWithOwnerInfo.bind(this)(dbBlog);
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
