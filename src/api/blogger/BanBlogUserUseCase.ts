import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../blogs/repository/blogs.repository';
import { UsersRepository } from '../users/repository/users.repository';
import { BlogUsersRepository } from '../blogs/repository/blog-users.repository';

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
    private readonly blogUsersRepository: BlogUsersRepository,
  ) {}

  async execute(command: BanBlogUserCommand) {
    const bannedUserId = command.payload.bannedUserId;

    const existedUser = await this.usersRepository.findById(bannedUserId);

    if (!existedUser) {
      throw new NotFoundException('User does not exist');
    }

    const existedBlog = await this.blogsRepository.findByIdWithOwnerInfo(
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

    await this.blogUsersRepository.create({
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
