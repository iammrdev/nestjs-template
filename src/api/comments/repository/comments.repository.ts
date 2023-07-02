import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CRUDRepository } from '../../../interfaces/crud-repository.interface';
import { CommentsModel, CommentRepo } from './comments.model';
import {
  CommentData,
  GetCommentsParams,
} from './comments.repository.interfece';
import { CommentsEntity } from '../service/comments.entity';
import { Pagination } from '../../../core/pagination';
import { PaginationList } from '../../../types/common';

@Injectable()
export class CommentsRepository
  implements CRUDRepository<CommentsEntity, string, CommentData>
{
  constructor(
    @InjectModel(CommentsModel.name)
    private readonly commentsModel: Model<CommentsModel>,
  ) {}

  private buildComment(dbComment: CommentRepo) {
    return {
      id: dbComment._id.toString(),
      postId: dbComment.postId,
      content: dbComment.content,
      likesInfo: dbComment.likesInfo,
      commentatorInfo: dbComment.commentatorInfo,
      createdAt: dbComment.createdAt,
    };
  }

  public async create(commentsEntity: CommentsEntity): Promise<CommentData> {
    const dbComment = await this.commentsModel.create(commentsEntity.toModel());

    return this.buildComment(dbComment);
  }

  public async findAll(
    params: GetCommentsParams,
  ): Promise<PaginationList<CommentData[]>> {
    const filter = { status: { $ne: 'hidden' } };

    const totalCount = await this.commentsModel.countDocuments(filter).exec();

    const pagination = new Pagination<CommentData>({
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
  ): Promise<PaginationList<CommentData[]>> {
    const filter = [{ postId }, { status: { $ne: 'hidden' } }];
    const totalCount = await this.commentsModel
      .countDocuments({ $and: filter })
      .exec();
    const pagination = new Pagination<CommentData>({
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
  ): Promise<PaginationList<CommentData[]>> {
    const filter = [
      { postId: { $in: postsIds } },
      { status: { $ne: 'hidden' } },
    ];
    const totalCount = await this.commentsModel
      .countDocuments({ $and: filter })
      .exec();

    const pagination = new Pagination<CommentData>({
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

  public async findById(id: string): Promise<CommentData | null> {
    const filter = [{ _id: id }, { status: { $ne: 'hidden' } }];

    const dbComment = await this.commentsModel.findOne({ $and: filter }).exec();

    return dbComment && this.buildComment(dbComment);
  }

  public async updateById(
    id: string,
    commentsEntity: CommentsEntity,
  ): Promise<CommentData | null> {
    const dbComment = await this.commentsModel
      .findByIdAndUpdate(id, commentsEntity.toModel(), { new: true })
      .exec();

    if (!dbComment) {
      throw new Error('Comment not updated');
    }

    return this.buildComment(dbComment);
  }

  public async updateStatusByAuthorId(
    authorId: string,
    status: 'active' | 'hidden',
  ): Promise<void> {
    await this.commentsModel
      .updateMany({ 'commentatorInfo.userId': authorId }, { status })
      .exec();
  }

  public async deleteById(id: string): Promise<number> {
    return (await this.commentsModel.deleteOne({ _id: id })).deletedCount;
  }

  public async deleteAll(): Promise<number> {
    return (await this.commentsModel.deleteMany()).deletedCount;
  }
}
