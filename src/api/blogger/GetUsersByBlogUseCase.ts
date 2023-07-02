import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogUsersRepository } from '../blogs/repository/blog-users.repository';

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
  constructor(private readonly blogUsersRepository: BlogUsersRepository) {}

  async execute(command: GetUsersByBlogCommand) {
    const blogId = command.payload.blogId;

    return this.blogUsersRepository.findAllUsersByBlog(
      blogId,

      { ...command.payload.params, isBanned: command.payload.isBanned },
    );
  }
}
