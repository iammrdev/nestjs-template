import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../repository/comments.repository';
import { GetCommentsQuery } from './comments.service.interface';
import { Comment } from '../../../types/comments';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async getCommentByPost(id: string, query: GetCommentsQuery) {
    return this.commentsRepository.findAllByPost(id, query);
  }

  async getCommentById(id: string): Promise<Comment | null> {
    return this.commentsRepository.findById(id);
  }

  async deleteAll(): Promise<void> {
    await this.commentsRepository.deleteAll();
  }
}
