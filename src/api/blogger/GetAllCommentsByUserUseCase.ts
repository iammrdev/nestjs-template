import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../blogs/repository/blogs.repository';
import { PostsRepository } from '../posts/repository/posts.repository';
import { CommentsRepository } from '../comments/repository/comments.repository';
import { CommentsEntity } from '../comments/service/comments.entity';

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
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(command: GetAllCommentsByUserCommand) {
    const userId = command.payload.userId;

    const userBlogs = await this.blogsRepository.findAllBlogsByUser(userId);
    const userPosts = await this.postsRepository.findAllByBlogs(
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
