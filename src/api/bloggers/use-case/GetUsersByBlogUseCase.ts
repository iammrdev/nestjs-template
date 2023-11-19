import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggersQueryRepository } from '../repository/bloggers.query.repository';
import { FindAllUsersByBlogResponse } from '../repository/bloggers.query.repository.types';

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

export type GetUsersByBlogUseCaseResult = FindAllUsersByBlogResponse;

export class GetUsersByBlogCommand {
  constructor(public payload: CommandPayload) {}
}

@CommandHandler(GetUsersByBlogCommand)
export class GetUsersByBlogUseCase
  implements ICommandHandler<GetUsersByBlogCommand>
{
  constructor(
    private readonly bloggersQueryRepository: BloggersQueryRepository,
  ) {}

  async execute(
    command: GetUsersByBlogCommand,
  ): Promise<GetUsersByBlogUseCaseResult> {
    const blogId = command.payload.blogId;

    return this.bloggersQueryRepository.findAllUsersByBlog(blogId, {
      ...command.payload.params,
      isBanned: command.payload.isBanned,
    });
  }
}
