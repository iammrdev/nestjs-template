import { Injectable } from '@nestjs/common';
import { AppBlog, AppBlogExtended } from '../../../../types/blogs';
import { BlogsModelData, BlogsSQLModelData } from '../blogs.model.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsSQLRepository {
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

  public async create(
    blogsData: Omit<BlogsModelData, '_id'>,
  ): Promise<AppBlog> {
    // const dbBlog = await this.blogsModel.create(blogModelData);

    // return this.buildBlog(dbBlog);

    const values = [
      blogsData.name,
      blogsData.description,
      blogsData.websiteUrl,
      blogsData.isMembership,
      blogsData.blogOwnerInfo?.userId,
      blogsData.blogOwnerInfo?.userLogin,
      blogsData.banInfo.isBanned,
      blogsData.banInfo.banDate,
      blogsData.createdAt,
    ];

    const [dbBlog] = await this.dataSource.query(
      `
    INSERT INTO blogs (
      "name",
      "description",
      "websiteUrl",
      "isMembership",
      "blogOwnerInfoUserId",
      "blogOwnerInfoUserLogin",
      "banInfoIsBanned",
      "banInfoBanDate",
      "createdAt"
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `,
      values,
    );

    return this.buildBlog(dbBlog);
  }

  public async findById(id: string): Promise<AppBlog | null> {
    const [dbBlog] = await this.dataSource.query<BlogsSQLModelData[]>(
      `SELECT * FROM blogs WHERE id=$1 LIMIT 1`,
      [id],
    );

    return dbBlog ? this.buildBlog(dbBlog) : null;
  }

  public async findByIdExtended(id: string): Promise<AppBlogExtended | null> {
    const [dbBlog] = await this.dataSource.query<BlogsSQLModelData[]>(
      `SELECT * FROM blogs WHERE id=$1 LIMIT 1`,
      [id],
    );

    return dbBlog ? this.buildExtendedBlog(dbBlog) : null;
  }

  public async updateById(
    id: string,
    blogsData: Omit<BlogsModelData, '_id'>,
  ): Promise<AppBlog | null> {
    // const dbBlog = await this.blogsModel
    //   .findByIdAndUpdate(id, blogModelData, { new: true })
    //   .exec();

    // return dbBlog && this.buildBlog(dbBlog);

    const values = [
      blogsData.name,
      blogsData.description,
      blogsData.websiteUrl,
      blogsData.isMembership,
      blogsData.blogOwnerInfo?.userId,
      blogsData.blogOwnerInfo?.userLogin,
      blogsData.banInfo.isBanned,
      blogsData.banInfo.banDate,
      blogsData.createdAt,
      id,
    ];

    const [dbBlog] = await this.dataSource.query(
      `
      UPDATE blogs
      SET
      "name"=$1,
      "description"=$2,
      "websiteUrl"=$3,
      "isMembership"=$4,
      "blogOwnerInfoUserId"=$5,
      "blogOwnerInfoUserLogin"=$6,
      "banInfoIsBanned"=$7,
      "banInfoBanDate"=$8,
      "createdAt"=$9
      WHERE "id"=$10
      RETURNING *;
  `,
      values,
    );

    return this.buildBlog(dbBlog);
  }

  public async deleteById(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM blogs WHERE id=$1`, [id]);
  }

  public async deleteAll(): Promise<void> {
    await this.dataSource.query(`DELETE FROM blogs`);
  }
}
