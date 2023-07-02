import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { PostsRepository } from '../posts/repository/posts.repository';
import { BlogsRepository } from '../blogs/repository/blogs.repository';

type CommandPayload = {
  blogId: string;
  isBanned: boolean;
};

export class BanBlogCommand {
  constructor(public payload: CommandPayload) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(command: BanBlogCommand) {
    const existedBlog = await this.blogsRepository.findByIdWithOwnerInfo(
      command.payload.blogId,
    );

    if (!existedBlog) {
      throw new BadRequestException('Blog does not exist');
    }

    await this.blogsRepository.updateBanByBlogId(existedBlog.id, {
      isBanned: command.payload.isBanned,
      banDate: command.payload.isBanned ? new Date() : null,
    });

    await this.postsRepository.updateStatusByBlogId(
      existedBlog.id,
      command.payload.isBanned ? 'hidden' : 'active',
    );
  }
}
