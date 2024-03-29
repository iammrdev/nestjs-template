import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { PostsRepository } from '../../posts/repository';
import { BlogsRepository } from '../../blogs/repository';
import { BlogsEntity } from '../../blogs/service/blogs.entity';

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

  async execute(command: BanBlogCommand): Promise<void> {
    const existedBlog = await this.blogsRepository.findByIdExtended(
      command.payload.blogId,
    );

    if (!existedBlog) {
      throw new BadRequestException('Blog does not exist');
    }

    const entity = new BlogsEntity({
      ...existedBlog,
      banInfo: {
        isBanned: command.payload.isBanned,
        banDate: command.payload.isBanned ? new Date() : null,
      },
    });

    await this.blogsRepository.updateById(existedBlog.id, entity.toModel());

    await this.postsRepository.setStatusByBlogId(
      existedBlog.id,
      command.payload.isBanned ? 'hidden-by-ban' : 'active',
    );
  }
}
