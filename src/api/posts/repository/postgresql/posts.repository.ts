import { Injectable } from '@nestjs/common';
import {
  PostsModelData,
  PostsSQLModelData,
  Status,
} from '../posts.model.types';
import { AppPost } from '../../../../types/posts';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsSQLRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private buildPost(dbPost: PostsSQLModelData): AppPost {
    return {
      id: dbPost.id,
      title: dbPost.title,
      shortDescription: dbPost.shortDescription,
      content: dbPost.content,
      status: dbPost.status,
      blogId: dbPost.blogId,
      blogName: dbPost.blogName,
      likesInfo: {
        likes: [],
        dislikes: [],
      },
      authorId: dbPost.authorId,
      createdAt: dbPost.createdAt,
    };
  }

  public async create(
    postsData: Omit<PostsModelData, '_id'>,
  ): Promise<AppPost> {
    const values = [
      postsData.title,
      postsData.shortDescription,
      postsData.content,
      postsData.blogId,
      postsData.blogName,
      postsData.authorId,
      postsData.status,
      postsData.createdAt,
    ];

    const [dbPost] = await this.dataSource.query(
      `
    INSERT INTO posts (
      "title",
      "shortDescription",
      "content",
      "blogId",
      "blogName",
      "authorId",
      "status",
      "createdAt"
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `,
      values,
    );

    return this.buildPost(dbPost);
  }

  public async findById(id: string): Promise<AppPost | null> {
    // const filter: AnyObject[] = [{ _id: id }, { status: { $ne: 'hidden' } }];

    const [dbPost] = await this.dataSource.query<PostsSQLModelData[]>(
      `SELECT * FROM posts WHERE id=$1 AND "status"!='hidden' LIMIT 1`,
      [id],
    );

    return dbPost ? this.buildPost(dbPost) : null;
  }

  public async updateById(
    id: string,
    postsData: Omit<PostsModelData, '_id'>,
  ): Promise<AppPost | null> {
    const values = [
      postsData.title,
      postsData.shortDescription,
      postsData.content,
      postsData.blogId,
      postsData.blogName,
      postsData.authorId,
      postsData.status,
      postsData.createdAt,
      id,
    ];

    const [dbPost] = await this.dataSource.query(
      `
      UPDATE posts
      SET
        "title"=$1,
        "shortDescription"=$2,
        "content"=$3,
        "blogId"=$4,
        "blogName"=$5,
        "authorId"=$6,
        "status"=$7,
        "createdAt"=$8
      WHERE "id"=$9
      RETURNING *;
  `,
      values,
    );

    return this.buildPost(dbPost);
  }

  public async setStatusByBlogId(
    blogId: string,
    status: Status,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE posts SET "status"=$1 WHERE "blogId"=$12`,
      [status, blogId],
    );
  }

  public async setStatusByAuthorId(
    authorId: string,
    status: Status,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE posts SET "status"=$1 WHERE "authorId"=$12`,
      [status, authorId],
    );
  }

  public async deleteById(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM posts WHERE id=$1`, [id]);
  }

  public async deleteAll(): Promise<void> {
    await this.dataSource.query(`DELETE FROM posts`);
  }
}
