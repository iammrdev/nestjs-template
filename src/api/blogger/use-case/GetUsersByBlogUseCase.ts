import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogUsersQueryRepository } from '../../blogs/repository/blog-users.query.repository';

export type GetUsersByBlogParams = {
  searchLoginTerm: string;
  sortBy: string;
  sortDirection: 'desc' | 'asc';
  pageNumber: number;
  pageSize: number;
};

type CommandPayload = {
  blogId: string;
  params: GetUsersByBlogParams;
  isBanned?: boolean;
};

export class GetUsersByBlogCommand {
  constructor(public payload: CommandPayload) {}
}

@CommandHandler(GetUsersByBlogCommand)
export class GetUsersByBlogUseCase
  implements ICommandHandler<GetUsersByBlogCommand>
{
  constructor(
    private readonly blogUsersQueryRepository: BlogUsersQueryRepository,
  ) {}

  async execute(command: GetUsersByBlogCommand) {
    const blogId = command.payload.blogId;

    return this.blogUsersQueryRepository.findAllUsersByBlog(blogId, {
      ...command.payload.params,
      isBanned: command.payload.isBanned,
    });
  }
}
