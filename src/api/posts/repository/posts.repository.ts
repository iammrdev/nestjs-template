import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CRUDRepository } from '../../../interfaces/crud-repository.interface';
import { PostRepo, PostsModel } from './posts.model';
import { PostsEntity } from '../service/posts.entity';
import { GetPostsParams, PostData } from './posts.repository.interfece';
import { Pagination } from '../../../core/pagination';
import { PaginationList } from '../../../types/common';

@Injectable()
export class PostsRepository
  implements CRUDRepository<PostsEntity, string, PostData>
{
  constructor(
    @InjectModel(PostsModel.name)
    private readonly postsModel: Model<PostsModel>,
  ) {}

  private buildPost(dbPost: PostRepo) {
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

  public async create(postsEntity: PostsEntity): Promise<PostData> {
    const dbPost = await this.postsModel.create(postsEntity.toModel());

    return this.buildPost(dbPost);
  }

  public async findAll(
    params: GetPostsParams,
  ): Promise<PaginationList<PostData[]>> {
    const totalCount = await this.postsModel.countDocuments().exec();

    const pagination = new Pagination<PostData>({
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

    const pagination = new Pagination<PostData>({
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

  public async findById(id: string): Promise<PostData | null> {
    const dbPost = await this.postsModel.findOne({ _id: id }).exec();

    return dbPost && this.buildPost(dbPost);
  }

  public async updateById(
    id: string,
    postsEntity: PostsEntity,
  ): Promise<PostData | null> {
    const dbPost = await this.postsModel
      .findByIdAndUpdate(id, postsEntity.toModel(), { new: true })
      .exec();

    if (!dbPost) {
      throw new Error('Post not updated');
    }

    return this.buildPost(dbPost);
  }

  public async deleteById(id: string): Promise<number> {
    return (await this.postsModel.deleteOne({ _id: id })).deletedCount;
  }

  public async deleteAll(): Promise<number> {
    return (await this.postsModel.deleteMany()).deletedCount;
  }
}
