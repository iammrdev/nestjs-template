import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyObject, Model } from 'mongoose';
import { PostsModel } from './posts.model';
import { Pagination } from '../../../core/pagination';
import { PaginationList } from '../../../types/common';
import { PostsModelData } from './posts.model.types';
import { GetPostsParams, PostsQueryData } from './posts.query.repository.types';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(PostsModel.name)
    private readonly postsModel: Model<PostsModel>,
  ) {}

  private buildPost(dbPost: PostsModelData): PostsQueryData {
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

  public async findAll(
    params: GetPostsParams,
    customfilter?: { blogId: string },
  ): Promise<PaginationList<PostsQueryData[]>> {
    const filter: AnyObject[] = [{ status: { $ne: 'hidden' } }];

    if (customfilter) {
      filter.push(customfilter);
    }

    const totalCount = await this.postsModel
      .countDocuments({ $and: filter })
      .exec();

    const pagination = new Pagination<PostsQueryData>({
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });

    const dbPosts = await this.postsModel
      .find({ $and: filter })
      .sort({ [params.sortBy]: params.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .exec();

    return pagination.setItems(dbPosts.map(this.buildPost)).toView();
  }

  public async findAllByBlog(
    blogId: string,
    params: GetPostsParams,
  ): Promise<PaginationList<PostsQueryData[]>> {
    return this.findAll(params, { blogId });
  }

  public async findAllByBlogs(blogIds: string[]) {
    return this.postsModel.find({ blogId: { $in: blogIds } });
  }
}
