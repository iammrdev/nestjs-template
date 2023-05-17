import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CRUDRepository } from '../../../interfaces/crud-repository.interface';
import { CommentsModel, DataComment } from './comments.model';
import { GetCommentsParams } from './comments.repository.interfece';
import { Comment } from '../../../types/comments';
import { CommentsEntity } from '../service/comments.entity';
import { Pagination } from '../../../core/pagination';
import { PaginationList } from '../../../types/common';

@Injectable()
export class CommentsRepository
  implements CRUDRepository<CommentsEntity, string, Comment>
{
  constructor(
    @InjectModel(CommentsModel.name)
    private readonly commentsModel: Model<CommentsModel>,
  ) {}

  private buildComment(dbComment: DataComment) {
    return {
      id: dbComment._id.toString(),
      content: dbComment.content,
      likesInfo: dbComment.likesInfo,
      commentatorInfo: dbComment.commentatorInfo,
      createdAt: dbComment.createdAt,
    };
  }

  public async create(commentEntity: CommentsEntity): Promise<Comment> {
    const dbComment = await this.commentsModel.create(commentEntity);

    return this.buildComment(dbComment);
  }

  public async findAll(
    params: GetCommentsParams,
  ): Promise<PaginationList<Comment[]>> {
    const totalCount = await this.commentsModel.countDocuments().exec();

    const pagination = new Pagination<Comment>({
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });

    const dbComments = await this.commentsModel
      .find()
      .sort({ [params.sortBy]: params.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .exec();

    return pagination.setItems(dbComments.map(this.buildComment)).toView();
  }

  public async findAllByPost(
    postId: string,
    params: GetCommentsParams,
  ): Promise<PaginationList<Comment[]>> {
    const filter = { postId };
    const totalCount = await this.commentsModel.countDocuments(filter).exec();
    const pagination = new Pagination<Comment>({
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

  public async findById(id: string): Promise<Comment | null> {
    const dbComment = await this.commentsModel.findOne({ _id: id }).exec();

    return dbComment && this.buildComment(dbComment);
  }

  public async updateById(
    id: string,
    commentsEntity: CommentsEntity,
  ): Promise<Comment | null> {
    const dbComment = await this.commentsModel
      .findByIdAndUpdate(id, commentsEntity.toObject(), { new: true })
      .exec();

    return dbComment && this.buildComment(dbComment);
  }

  public async deleteById(id: string): Promise<number> {
    return (await this.commentsModel.deleteOne({ _id: id })).deletedCount;
  }

  public async deleteAll(): Promise<number> {
    return (await this.commentsModel.deleteMany()).deletedCount;
  }
}
