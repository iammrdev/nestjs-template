import { Injectable } from '@nestjs/common';
import { AppBlog, AppBlogExtended } from '../../../../types/blogs';
import { Pagination } from '../../../../core/pagination';
import { BlogsSQLModelData } from '../blogs.model.types';
import {
  FindAllBlogsByUserResponse,
  FindAllBlogsByUserWithPaginationResponse,
  FindAllBlogsExtendedResponse,
  FindAllBlogsParams,
  FindAllBlogsResponse,
} from '../blogs.query.repository.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsQuerySQLRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private buildBlog(dataBlog: BlogsSQLModelData): AppBlog {
    return {
      id: dataBlog.id,
      name: dataBlog.name,
      description: dataBlog.description,
      websiteUrl: dataBlog.websiteUrl,
      isMembership: dataBlog.isMembership,
      createdAt: dataBlog.createdAt,
    };
  }

  private buildExtendedBlog(dataBlog: BlogsSQLModelData): AppBlogExtended {
    return {
      ...this.buildBlog(dataBlog),
      blogOwnerInfo:
        dataBlog.blogOwnerInfoUserId && dataBlog.blogOwnerInfoUserLogin
          ? {
              userId: dataBlog.blogOwnerInfoUserId,
              userLogin: dataBlog.blogOwnerInfoUserLogin,
            }
          : null,
      banInfo: {
        isBanned: dataBlog.banInfoIsBanned,
        banDate: dataBlog.banInfoBanDate,
      },
    };
  }

  private buildPaginationFilter(params: FindAllBlogsParams): string {
    if (!params.searchNameTerm) {
      return '';
    }
    return ` WHERE UPPER("name") like UPPER('%${params.searchNameTerm}%')`;
  }

  private async buildPagination(
    paginationParams: {
      pageNumber: number;
      pageSize: number;
      sortBy: string;
      sortDirection: 'asc' | 'desc';
    },
    filter: string,
  ): Promise<Pagination<BlogsSQLModelData>> {
    const [countData] = await this.dataSource
      .query(`SELECT COUNT (*) FROM "blogs"${filter}
    `);

    const pagination = new Pagination<BlogsSQLModelData>({
      page: paginationParams.pageNumber,
      pageSize: paginationParams.pageSize,
      totalCount: Number(countData.count),
    });

    const dbBlogs = await this.dataSource.query(
      `SELECT * FROM blogs${filter} ORDER BY "${paginationParams.sortBy}" ${paginationParams.sortDirection} LIMIT $1 OFFSET $2`,
      [pagination.pageSize, pagination.skip],
    );

    pagination.setItems(dbBlogs);

    return pagination;
  }

  public async findAllBlogs(
    params: FindAllBlogsParams,
  ): Promise<FindAllBlogsResponse> {
    const paginationFilter = this.buildPaginationFilter(params);
    const banInfoIsBanned = `"banInfoIsBanned"!=${true}`;

    const filter = paginationFilter
      ? `${paginationFilter} AND ${banInfoIsBanned}`
      : ` WHERE ${banInfoIsBanned}`;

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
    const dbBlogs = await this.dataSource.query<BlogsSQLModelData[]>(
      `SELECT * FROM blogs WHERE "blogOwnerInfoUserId"=$1`,
      [userId],
    );

    return dbBlogs.map(this.buildBlog);
  }

  public async findAllByUserWithPagination(
    userId: string,
    params: FindAllBlogsParams,
  ): Promise<FindAllBlogsByUserWithPaginationResponse> {
    const paginationFilter = this.buildPaginationFilter(params);
    const filter = paginationFilter
      ? `${paginationFilter} AND "blogOwnerInfoUserId"=${userId}`
      : ` WHERE "blogOwnerInfoUserId"=${userId}`;

    const pagination = await this.buildPagination(params, filter);

    return pagination.toView(this.buildBlog);
  }
}
