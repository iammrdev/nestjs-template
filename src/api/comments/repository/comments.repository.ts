import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentsModel } from './comments.model';
import { CommentsModelData, Status } from './comments.model.types';
import { AppComment } from '../../../types/comments';

@Injectable()
export class CommentsRepository {
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
      status: dbComment.status,
      commentatorInfo: dbComment.commentatorInfo,
      createdAt: dbComment.createdAt,
    };
  }

  public async create(
    commentsModelData: Omit<CommentsModelData, '_id'>,
  ): Promise<AppComment> {
    const dbComment = await this.commentsModel.create(commentsModelData);

    return this.buildComment(dbComment);
  }

  public async findById(id: string): Promise<AppComment | null> {
    const filter = [{ _id: id }, { status: { $ne: 'hidden' } }];

    const dbComment = await this.commentsModel.findOne({ $and: filter }).exec();

    return dbComment && this.buildComment(dbComment);
  }

  public async updateById(
    id: string,
    commentsModelData: Omit<CommentsModelData, '_id'>,
  ): Promise<AppComment | null> {
    const dbComment = await this.commentsModel
      .findByIdAndUpdate(id, commentsModelData, { new: true })
      .exec();

    if (!dbComment) {
      throw new Error('Comment not updated');
    }

    return this.buildComment(dbComment);
  }

  public async setStatusByAuthorId(
    authorId: string,
    status: Status,
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
