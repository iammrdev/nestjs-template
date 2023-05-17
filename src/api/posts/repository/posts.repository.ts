import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CRUDRepository } from '../../../interfaces/crud-repository.interface';
import { DataPost, PostsModel } from './posts.model';
import { Post } from '../../../types/posts';
import { PostsEntity } from '../service/posts.entity';
import { GetPostsParams } from './posts.repository.interfece';
import { Pagination } from '../../../core/pagination';

@Injectable()
export class PostsRepository
  implements CRUDRepository<PostsEntity, string, Post>
{
  constructor(
    @InjectModel(PostsModel.name)
    private readonly postsModel: Model<PostsModel>,
  ) {}

  private buildPost(dbPost: DataPost) {
    return {
      id: dbPost._id.toString(),
      title: dbPost.title,
      shortDescription: dbPost.shortDescription,
      content: dbPost.content,
      blogId: dbPost.blogId,
      blogName: dbPost.blogName,
      extendedLikesInfo: dbPost.extendedLikesInfo,
      createdAt: dbPost.createdAt,
    };
  }

  public async create(postsEntity: PostsEntity): Promise<Post> {
    const dbPost = await this.postsModel.create(postsEntity);

    return this.buildPost(dbPost);
  }

  public async findAll(params: GetPostsParams): Promise<any> {
    const totalCount = await this.postsModel.countDocuments().exec();

    const pagination = new Pagination<Post>({
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });

    const dbPosts = await this.postsModel
      .find()
      .sort({ [params.sortBy]: params.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .exec();

    return pagination.setItems(dbPosts.map(this.buildPost)).toView();
  }

  public async findAllByBlog(
    blogId: string,
    params: GetPostsParams,
  ): Promise<any> {
    const filter = { blogId };
    const totalCount = await this.postsModel.countDocuments(filter).exec();

    const pagination = new Pagination<Post>({
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });

    const dbPosts = await this.postsModel
      .find(filter)
      .sort({ [params.sortBy]: params.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .exec();

    return pagination.setItems(dbPosts.map(this.buildPost)).toView();
  }

  public async findById(id: string): Promise<Post | null> {
    const dbPost = await this.postsModel.findOne({ _id: id }).exec();

    return dbPost && this.buildPost(dbPost);
  }

  public async updateById(
    id: string,
    postsEntity: PostsEntity,
  ): Promise<Post | null> {
    const mongoPost = await this.postsModel
      .findByIdAndUpdate(id, postsEntity.toObject(), { new: true })
      .exec();

    return mongoPost && this.buildPost(mongoPost);
  }

  public async deleteById(id: string): Promise<number> {
    return (await this.postsModel.deleteOne({ _id: id })).deletedCount;
  }

  public async deleteAll(): Promise<number> {
    return (await this.postsModel.deleteMany()).deletedCount;
  }
}
