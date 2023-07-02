import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../users/repository/users.repository';
import { BadRequestException } from '@nestjs/common';
import { BlogsRepository } from '../blogs/repository/blogs.repository';
import { BlogsEntity } from '../blogs/service/blogs.entity';

type CommandPayload = {
  userId: string;
  blogId: string;
};

export class BindUserWithBlogCommand {
  constructor(public payload: CommandPayload) {}
}

@CommandHandler(BindUserWithBlogCommand)
export class BindUserWithBlogUseCase
  implements ICommandHandler<BindUserWithBlogCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: BindUserWithBlogCommand) {
    const existedUser = await this.usersRepository.findById(
      command.payload.userId,
    );

    if (!existedUser) {
      throw new BadRequestException('User does not exist');
    }

    const existedBlog = await this.blogsRepository.findById(
      command.payload.blogId,
    );

    if (!existedBlog || existedBlog.blogOwnerInfo) {
      throw new BadRequestException('Invalid blog owner info');
    }

    const entity = new BlogsEntity({
      ...existedBlog,
      blogOwnerInfo: { userId: existedUser.id, userLogin: existedUser.login },
    });

    await this.blogsRepository.updateById(existedBlog.id, entity);
  }
}
