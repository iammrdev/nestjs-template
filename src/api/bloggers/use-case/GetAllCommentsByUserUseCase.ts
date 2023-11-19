import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsEntity } from '../../comments/service/comments.entity';
import { BlogsQueryRepository } from '../../blogs/repository/blogs.query.repository';
import { PostsQueryRepository } from '../../posts/repository/posts.query.repository';
import { CommentsQueryRepository } from '../../comments/repository/comments.query.repository';
import { PaginationList } from '../../../types/common';
import { LikeStatus } from '../../../types/likes';

type GetAllCommentsByUserParams = {
  sortBy: string;
  sortDirection: 'desc' | 'asc';
  pageNumber: number;
  pageSize: number;
};

type CommentData = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };
  createdAt: Date;
  postInfo:
    | {
        id: string;
        title: string;
        blogId: string;
        blogName: string;
      }
    | undefined;
};

type CommandPayload = {
  userId: string;
  query: GetAllCommentsByUserParams;
};

export type GetAllCommentsByUserUseCaseResult = PaginationList<CommentData[]>;

export class GetAllCommentsByUserCommand {
  constructor(public payload: CommandPayload) {}
}

@CommandHandler(GetAllCommentsByUserCommand)
export class GetAllCommentsByUserUseCase
  implements ICommandHandler<GetAllCommentsByUserCommand>
{
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async execute(
    command: GetAllCommentsByUserCommand,
  ): Promise<GetAllCommentsByUserUseCaseResult> {
    const userId = command.payload.userId;

    // #todo: заменить на базовый репозиторий без пагинации
    const userBlogs = await this.blogsQueryRepository.findAllBlogsByUser(
      userId,
    );

    const userPosts = await this.postsQueryRepository.findAllPostsByBlogs(
      userBlogs.map((item) => item.id),
    );

    const userComments = await this.commentsQueryRepository.findAllByPosts(
      userPosts.map((item) => item.id),
      command.payload.query,
    );

    return {
      ...userComments,
      items: userComments.items.map((comment) => {
        const post = userPosts.find((post) => post.id === comment.postId);

        return {
          ...new CommentsEntity(comment).setCurrentUser(userId).toView(),
          postInfo: post && {
            id: post.id,
            title: post.title,
            blogId: post.blogId,
            blogName: post.blogName,
          },
        };
      }),
    };
  }
}
