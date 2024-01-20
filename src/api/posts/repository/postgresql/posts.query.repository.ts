import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Pagination } from '../../../../core/pagination';
import { PostsSQLModelData } from '../posts.model.types';
import {
  FindAllPostsByBlogResponse,
  FindAllPostsByBlogsResponse,
  FindAllPostsResponse,
  GetPostsParams,
} from '../posts.query.repository.types';
import { AppPost } from '../../../../types/posts';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class PostsQuerySQLRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private buildPost(dbPost: PostsSQLModelData): AppPost {
    return {
      id: dbPost.id,
      title: dbPost.title,
      shortDescription: dbPost.shortDescription,
      content: dbPost.content,
      blogId: dbPost.blogId,
      blogName: dbPost.blogName,
      status: dbPost.status,
      likesInfo: {
        likes: [],
        dislikes: [],
      },
      authorId: dbPost.authorId,
      createdAt: dbPost.createdAt,
    };
  }

  private buildPaginationFilter(params?: { blogId: string }): string {
    let filter = ` WHERE "status" != 'hidden-by-ban'`;

    if (params) {
      filter = `${filter} AND ${params}`;
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
    filter: string,
  ): Promise<Pagination<PostsSQLModelData>> {
    const [countData] = await this.dataSource
      .query(`SELECT COUNT (*) FROM "posts"${filter}
  `);

    const pagination = new Pagination<PostsSQLModelData>({
      page: paginationParams.pageNumber,
      pageSize: paginationParams.pageSize,
      totalCount: Number(countData.count),
    });

    const dbPosts = await this.dataSource.query(
      `SELECT * FROM posts${filter} ORDER BY "${paginationParams.sortBy}" ${paginationParams.sortDirection} LIMIT $1 OFFSET $2`,
      [pagination.pageSize, pagination.skip],
    );
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
    // return this.postsModel.find({ blogId: { $in: blogIds } });

    const dbPosts = await this.dataSource.query<PostsSQLModelData[]>(
      `SELECT * FROM posts WHERE blogId IN (...${blogIds})`,
    );

    return dbPosts.map((post) => this.buildPost(post));
  }
}
