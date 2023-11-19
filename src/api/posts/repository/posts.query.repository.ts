import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyObject, Model } from 'mongoose';
import { PostsModel } from './posts.model';
import { Pagination } from '../../../core/pagination';
import { PostsModelData } from './posts.model.types';
import {
  FindAllPostsByBlogResponse,
  FindAllPostsByBlogsResponse,
  FindAllPostsResponse,
  GetPostsParams,
} from './posts.query.repository.types';
import { AppPost } from '../../../types/posts';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(PostsModel.name)
    private readonly postsModel: Model<PostsModel>,
  ) {}

  private buildPost(dbPost: PostsModelData): AppPost {
    return {
      id: dbPost._id.toString(),
      title: dbPost.title,
      shortDescription: dbPost.shortDescription,
      content: dbPost.content,
      blogId: dbPost.blogId,
      blogName: dbPost.blogName,
      status: dbPost.status,
      likesInfo: dbPost.likesInfo,
      authorId: dbPost.authorId,
      createdAt: dbPost.createdAt,
    };
  }

  private buildPaginationFilter(params?: {
    blogId: string;
  }): Record<string, any> {
    const filter: AnyObject[] = [{ status: { $ne: 'hidden' } }];

    if (params) {
      filter.push(params);
    }

    return filter;
  }

  private async buildPagination(
    paginationParams: {
      pageNumber: number;
      pageSize: number;
      sortBy: string;
      sortDirection: 'asc' | 'desc';
    },
    filter: AnyObject,
  ): Promise<Pagination<PostsModelData>> {
    const totalCount = await this.postsModel.countDocuments(filter).exec();

    const pagination = new Pagination<PostsModelData>({
      page: paginationParams.pageNumber,
      pageSize: paginationParams.pageSize,
      totalCount,
    });

    const dbPosts = await this.postsModel
      .find(filter)
      .sort({ [paginationParams.sortBy]: paginationParams.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .exec();

    pagination.setItems(dbPosts);

    return pagination;
  }

  public async findAllPosts(
    params: GetPostsParams,
  ): Promise<FindAllPostsResponse> {
    const filter = this.buildPaginationFilter();

    const pagination = await this.buildPagination(params, filter);

    return pagination.toView(this.buildPost);
  }

  public async findAllPostsByBlog(
    blogId: string,
    params: GetPostsParams,
  ): Promise<FindAllPostsByBlogResponse> {
    const filter = this.buildPaginationFilter({ blogId });

    const pagination = await this.buildPagination(params, filter);

    return pagination.toView(this.buildPost);
  }

  public async findAllPostsByBlogs(
    blogIds: string[],
  ): Promise<FindAllPostsByBlogsResponse> {
    return this.postsModel.find({ blogId: { $in: blogIds } });
  }
}
