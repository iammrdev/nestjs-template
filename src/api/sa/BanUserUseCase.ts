import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../users/repository/users.repository';
import { BadRequestException } from '@nestjs/common';
import { UsersEntity } from '../users/service/users.entity';
import { TokensRepository } from '../auth/repository/tokens.repository';
import { PostsRepository } from '../posts/repository/posts.repository';
import { CommentsRepository } from '../comments/repository/comments.repository';

type CommandPayload = {
  userId: string;
  isBanned: boolean;
  banReason: string;
};

export class BanUserCommand {
  constructor(public payload: CommandPayload) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly tokensRepository: TokensRepository,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(command: BanUserCommand) {
    const existedUser = await this.usersRepository.findById(
      command.payload.userId,
    );

    if (!existedUser) {
      throw new BadRequestException('User does not exist');
    }

    const entity = new UsersEntity(existedUser).handleBan(command.payload);

    await this.usersRepository.updateById(existedUser.id, entity);

    await this.tokensRepository.deleteById(existedUser.id);

    await this.postsRepository.updateStatusByAuthorId(
      existedUser.id,
      command.payload.isBanned ? 'hidden' : 'active',
    );
    await this.commentsRepository.updateStatusByAuthorId(
      existedUser.id,
      command.payload.isBanned ? 'hidden' : 'active',
    );
  }
}
