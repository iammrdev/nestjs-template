import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyObject, Model } from 'mongoose';
import { PostsModel } from './posts.model';
import { PostsEntity } from '../service/posts.entity';
import { PostsModelData, Status } from './posts.model.types';
import { AppPost } from '../../../types/posts';

@Injectable()
export class PostsRepository {
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
      status: dbPost.status,
      blogId: dbPost.blogId,
      blogName: dbPost.blogName,
      likesInfo: dbPost.likesInfo,
      authorId: dbPost.authorId,
      createdAt: dbPost.createdAt,
    };
  }

  public async create(
    postsEntity: Omit<PostsModelData, '_id'>,
  ): Promise<AppPost> {
    const dbPost = await this.postsModel.create(postsEntity);

    return this.buildPost(dbPost);
  }

  public async findById(id: string): Promise<AppPost | null> {
    const filter: AnyObject[] = [{ _id: id }, { status: { $ne: 'hidden' } }];

    const dbPost = await this.postsModel.findOne({ $and: filter }).exec();

    return dbPost && this.buildPost(dbPost);
  }

  public async updateById(
    id: string,
    postsEntity: PostsEntity,
  ): Promise<AppPost | null> {
    const dbPost = await this.postsModel
      .findByIdAndUpdate(id, postsEntity.toModel(), { new: true })
      .exec();

    if (!dbPost) {
      throw new Error('Post not updated');
    }

    return this.buildPost(dbPost);
  }

  public async setStatusByBlogId(
    blogId: string,
    status: Status,
  ): Promise<void> {
    await this.postsModel.updateMany({ blogId }, { status }).exec();
  }

  public async setStatusByAuthorId(
    authorId: string,
    status: Status,
  ): Promise<void> {
    await this.postsModel.updateMany({ authorId }, { status }).exec();
  }

  public async deleteById(id: string): Promise<number> {
    return (await this.postsModel.deleteOne({ _id: id })).deletedCount;
  }

  public async deleteAll(): Promise<number> {
    return (await this.postsModel.deleteMany()).deletedCount;
  }
}
