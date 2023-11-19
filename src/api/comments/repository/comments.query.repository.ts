import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentsModel } from './comments.model';
import { Pagination } from '../../../core/pagination';
import { PaginationList } from '../../../types/common';
import { GetCommentsParams } from './comments.query.repository.types';
import { CommentsModelData } from './comments.model.types';
import { AppComment } from '../../../types/comments';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(CommentsModel.name)
    private readonly commentsModel: Model<CommentsModel>,
  ) {}

  private buildComment(dbComment: CommentsModelData): AppComment {
    return {
      id: dbComment._id.toString(),
      postId: dbComment.postId,
      content: dbComment.content,
      likesInfo: dbComment.likesInfo,
      commentatorInfo: dbComment.commentatorInfo,
      status: dbComment.status,
      createdAt: dbComment.createdAt,
    };
  }

  public async findAll(
    params: GetCommentsParams,
  ): Promise<PaginationList<AppComment[]>> {
    const filter = { status: { $ne: 'hidden' } };

    const totalCount = await this.commentsModel.countDocuments(filter).exec();

    const pagination = new Pagination<AppComment>({
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });

    const dbComments = await this.commentsModel
      .find(filter)
      .sort({ [params.sortBy]: params.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .exec();

    return pagination.setItems(dbComments.map(this.buildComment)).toView();
  }

  public async findAllByPost(
    postId: string,
    params: GetCommentsParams,
  ): Promise<PaginationList<AppComment[]>> {
    const filter = [{ postId }, { status: { $ne: 'hidden' } }];
    const totalCount = await this.commentsModel
      .countDocuments({ $and: filter })
      .exec();
    const pagination = new Pagination<AppComment>({
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });

    const dbComments = await this.commentsModel
      .find({ $and: filter })
      .sort({ [params.sortBy]: params.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .exec();

    return pagination.setItems(dbComments.map(this.buildComment)).toView();
  }

  public async findAllByPosts(
    postsIds: string[],
    params: GetCommentsParams,
  ): Promise<PaginationList<AppComment[]>> {
    const filter = [
      { postId: { $in: postsIds } },
      { status: { $ne: 'hidden' } },
    ];
    const totalCount = await this.commentsModel
      .countDocuments({ $and: filter })
      .exec();

    const pagination = new Pagination<AppComment>({
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });

    const dbComments = await this.commentsModel
      .find({ $and: filter })
      .sort({ [params.sortBy]: params.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .exec();

    return pagination.setItems(dbComments.map(this.buildComment)).toView();
  }
}
