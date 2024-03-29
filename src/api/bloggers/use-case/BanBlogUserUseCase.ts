import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../blogs/repository';
import { UsersRepository } from '../../users/repository';
import { BloggersRepository } from '../repository/bloggers.repository';

type CommandPayload = {
  blogId: string;
  ownerId: string;
  bannedUserId: string;
  banInfo: {
    isBanned: boolean;
    banReason: string;
  };
};

export class BanBlogUserCommand {
  constructor(public payload: CommandPayload) {}
}

@CommandHandler(BanBlogUserCommand)
export class BanBlogUserUseCase implements ICommandHandler<BanBlogUserCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly bloggersRepository: BloggersRepository,
  ) {}

  async execute(command: BanBlogUserCommand): Promise<void> {
    const bannedUserId = command.payload.bannedUserId;

    const existedUser = await this.usersRepository.findById(bannedUserId);

    if (!existedUser) {
      throw new NotFoundException('User does not exist');
    }

    const existedBlog = await this.blogsRepository.findByIdExtended(
      command.payload.blogId,
    );

    if (!existedBlog) {
      throw new NotFoundException('Blog does not exist');
    }

    if (
      existedBlog.blogOwnerInfo &&
      existedBlog.blogOwnerInfo.userId !== command.payload.ownerId
    ) {
      throw new ForbiddenException('Forbidden action for this blog');
    }

    const isBanned = command.payload.banInfo.isBanned;

    await this.bloggersRepository.create({
      userId: existedUser.id,
      userLogin: existedUser.login,
      blogId: existedBlog.id,
      banInfo: {
        isBanned,
        banDate: isBanned ? new Date() : null,
        banReason: isBanned ? command.payload.banInfo.banReason : null,
      },
    });
  }
}
