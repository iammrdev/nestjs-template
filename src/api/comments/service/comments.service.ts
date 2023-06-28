import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentsRepository } from '../repository/comments.repository';
import {
  CreateCommentDto,
  GetCommentsQuery,
  UpdateCommentDto,
  UpdateCommentLikeStatusDto,
} from './comments.service.interface';
import { Comment } from '../../../types/comments';
import { CommentsEntity } from './comments.entity';
import { UsersService } from '../../users';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly usersService: UsersService,
  ) {}

  async createCommentByPost(
    postId: string,
    dto: CreateCommentDto,
  ): Promise<Comment> {
    const entity = new CommentsEntity({
      content: dto.content,
      postId,
      commentatorInfo: {
        userId: dto.userId,
        userLogin: dto.userLogin,
      },
      likesInfo: {
        dislikes: [],
        likes: [],
      },
      createdAt: new Date(),
    });

    const { id } = await this.commentsRepository.create(entity);

    return entity.setId(id).toView();
  }

  async getCommentByPost(
    postId: string,
    query: GetCommentsQuery,
    { userId }: { userId?: string },
  ) {
    const comments = await this.commentsRepository.findAllByPost(postId, query);
    const bannedUsersIds = await this.usersService.getUsersBanned();

    return {
      ...comments,
      items: comments.items.map((comment) =>
        new CommentsEntity(comment)
          .setCurrentUser(userId)
          .setBannedUsersIds(bannedUsersIds)
          .toView(),
      ),
    };
  }

  async getCommentById(
    commentId: string,
    { userId }: { userId?: string },
  ): Promise<Comment | null> {
    const commentData = await this.commentsRepository.findById(commentId);

    if (!commentData) {
      return null;
    }

    const bannedUsersIds = await this.usersService.getUsersBanned();

    return new CommentsEntity(commentData)
      .setCurrentUser(userId)
      .setBannedUsersIds(bannedUsersIds)
      .toView();
  }

  async updateCommentById(
    id: string,
    dto: UpdateCommentDto,
  ): Promise<Comment | null> {
    const existedComment = await this.commentsRepository.findById(id);

    if (!existedComment) {
      throw new NotFoundException('Comment is not found');
    }

    if (existedComment.commentatorInfo.userId !== dto.userId) {
      throw new ForbiddenException('Forbidden');
    }

    const entity = new CommentsEntity({
      ...existedComment,
      content: dto.content,
    }).setCurrentUser(dto.userId);

    await this.commentsRepository.updateById(id, entity);

    return entity.toView();
  }

  async updateCommentLikeStatusById(
    id: string,
    dto: UpdateCommentLikeStatusDto,
  ): Promise<Comment | null> {
    const existedComment = await this.commentsRepository.findById(id);

    if (!existedComment) {
      throw new NotFoundException('Comment is not found');
    }

    const entity = new CommentsEntity({
      ...existedComment,
      likesInfo: existedComment.likesInfo,
    })
      .setCurrentUser(dto.userId)
      .setLikeStatus(dto.likeStatus);

    await this.commentsRepository.updateById(id, entity);

    return entity.toView();
  }

  async deleteCommentById(id: string, dto: { userId?: string }): Promise<void> {
    const existedComment = await this.commentsRepository.findById(id);

    if (!existedComment) {
      throw new NotFoundException('Comment is not found');
    }

    if (existedComment.commentatorInfo.userId !== dto.userId) {
      throw new ForbiddenException('Forbidden');
    }

    await this.commentsRepository.deleteById(id);
  }

  async deleteAll(): Promise<void> {
    await this.commentsRepository.deleteAll();
  }
}
