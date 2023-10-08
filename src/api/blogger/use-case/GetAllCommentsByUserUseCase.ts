import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../comments/repository/comments.repository';
import { CommentsEntity } from '../../comments/service/comments.entity';
import { BlogsQueryRepository } from '../../blogs/repository/blogs.query.repository';
import { PostsQueryRepository } from '../../posts/repository/posts.query.repository';

export type GetAllCommentsByUseParams = {
  sortBy: string;
  sortDirection: 'desc' | 'asc';
  pageNumber: number;
  pageSize: number;
};

type CommandPayload = {
  userId: string;
  query: GetAllCommentsByUseParams;
};

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
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(command: GetAllCommentsByUserCommand) {
    const userId = command.payload.userId;

    // #todo: заменить на базовый репозиторий без пагинации
    const userBlogs = await this.blogsQueryRepository.findAllByUser(userId);

    const userPosts = await this.postsQueryRepository.findAllByBlogs(
      userBlogs.map((item) => item.id),
    );

    const userComments = await this.commentsRepository.findAllByPosts(
      userPosts.map((item) => item.id),
      command.payload.query,
    );

    return {
      ...userComments,
      items: userComments.items.map((comment) => {
        const post = userPosts.find((post) => post.id === comment.postId);

        return {
          ...new CommentsEntity(comment).setCurrentUser(userId).toView(),
          postInfo: {
            id: post?.id,
            title: post?.title,
            blogId: post?.blogId,
            blogName: post?.blogName,
          },
        };
      }),
    };
  }
}
