import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { TokensRepository } from '../repository/tokens.repository';

type CommandPayload = {
  userInfo: {
    id: string;
    login: string;
    email: string;
    refreshToken: string;
  };
};

export type LogoutUserUseCaseResult = void;

export class LogoutUserCommand {
  constructor(public payload: CommandPayload) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(private readonly tokensRepository: TokensRepository) {}

  async execute(command: LogoutUserCommand): Promise<LogoutUserUseCaseResult> {
    const userInfo = command.payload.userInfo;
    const tokenInfo = await this.tokensRepository.findByToken(
      userInfo.refreshToken,
    );

    if (!tokenInfo) {
      throw new UnauthorizedException('forbidden');
    }

    await this.tokensRepository.deleteById(tokenInfo.id);
  }
}
