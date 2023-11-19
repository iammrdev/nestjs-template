import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { TokensRepository } from '../repository/tokens.repository';
import { AuthService } from '../service/auth.service';

type CommandPayload = {
  userInfo: {
    id: string;
    login: string;
    email: string;
    refreshToken: string;
  };
  ip: string;
  userAgent: string;
};

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type GenerateNewTokensUseCaseResult = Tokens;

export class GenerateNewTokensCommand {
  constructor(public payload: CommandPayload) {}
}

@CommandHandler(GenerateNewTokensCommand)
export class GenerateNewTokensUseCase
  implements ICommandHandler<GenerateNewTokensCommand>
{
  constructor(
    private readonly authService: AuthService,
    private readonly tokensRepository: TokensRepository,
  ) {}

  async execute(
    command: GenerateNewTokensCommand,
  ): Promise<GenerateNewTokensUseCaseResult> {
    const userInfo = command.payload.userInfo;
    const tokenInfo = await this.tokensRepository.findByToken(
      userInfo.refreshToken,
    );

    if (!tokenInfo) {
      throw new UnauthorizedException('forbidden');
    }

    await this.tokensRepository.deleteById(tokenInfo.id);

    return this.authService.generateTokens({
      userId: userInfo.id,
      login: userInfo.login,
      email: userInfo.email,
      deviceId: tokenInfo.deviceId,
      ip: command.payload.ip,
      title: command.payload.userAgent,
    });
  }
}
