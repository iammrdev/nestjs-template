import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentsRepository } from '../repository/comments.repository';
import {
  CreateCommentParams,
  GetCommentsParams,
  UpdateCommentParams,
  UpdateCommentLikeStatusParams,
} from './comments.service.types';
import {
  CommentView,
  CommentsEntity,
  createCommentsEntity,
} from './comments.entity';
import { UsersService } from '../../users';
import { CommentsQueryRepository } from '../repository/comments.query.repository';
import { PaginationList } from 'src/types/common';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly usersService: UsersService,
  ) {}

  async createCommentByPost(
    postId: string,
    params: CreateCommentParams,
  ): Promise<CommentView> {
    const entity = createCommentsEntity({
      content: params.content,
      postId,
      userId: params.userId,
      userLogin: params.userLogin,
    });

    const { id } = await this.commentsRepository.create(entity.toModel());

    return entity.setId(id).toView();
  }

  async getCommentsByPost(
    postId: string,
    query: GetCommentsParams,
    { userId }: { userId: string },
  ): Promise<PaginationList<CommentView[]>> {
    const comments = await this.commentsQueryRepository.findAllByPost(
      postId,
      query,
    );
    const bannedUsersIds = await this.usersService.getBannedUsersIds();

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
  ): Promise<CommentView | null> {
    const commentData = await this.commentsRepository.findById(commentId);

    if (!commentData) {
      return null;
    }

    const bannedUsersIds = await this.usersService.getBannedUsersIds();

    return new CommentsEntity(commentData)
      .setCurrentUser(userId)
      .setBannedUsersIds(bannedUsersIds)
      .toView();
  }

  async updateCommentById(
    id: string,
    params: UpdateCommentParams,
  ): Promise<CommentView> {
    const existedComment = await this.commentsRepository.findById(id);

    if (!existedComment) {
      throw new NotFoundException('Comment is not found');
    }

    if (existedComment.commentatorInfo.userId !== params.userId) {
      throw new ForbiddenException('Forbidden');
    }

    const entity = new CommentsEntity({
      ...existedComment,
      content: params.content,
    }).setCurrentUser(params.userId);

    await this.commentsRepository.updateById(id, entity);

    return entity.toView();
  }

  async updateCommentLikeStatusById(
    id: string,
    params: UpdateCommentLikeStatusParams,
  ): Promise<CommentView> {
    const existedComment = await this.commentsRepository.findById(id);

    if (!existedComment) {
      throw new NotFoundException('Comment is not found');
    }

    const entity = new CommentsEntity({
      ...existedComment,
      likesInfo: existedComment.likesInfo,
    })
      .setCurrentUser(params.userId)
      .setLikeStatus(params.likeStatus);

    await this.commentsRepository.updateById(id, entity);

    return entity.toView();
  }

  async deleteCommentById(
    id: string,
    params: { userId?: string },
  ): Promise<void> {
    const existedComment = await this.commentsRepository.findById(id);

    if (!existedComment) {
      throw new NotFoundException('Comment is not found');
    }

    if (existedComment.commentatorInfo.userId !== params.userId) {
      throw new ForbiddenException('Forbidden');
    }

    await this.commentsRepository.deleteById(id);
  }

  async deleteAll(): Promise<void> {
    await this.commentsRepository.deleteAll();
  }
}
