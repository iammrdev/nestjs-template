import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { UserView, UsersEntity } from '../../users/service/users.entity';
import { UsersRepository } from '../../users/repository';
import { AuthService } from '../service/auth.service';

type CommandPayload = {
  loginOrEmail: string;
  password: string;
  ip: string;
  userAgent: string;
};

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export class VerifyUserDto {
  public loginOrEmail: string;
  public password: string;
}

export type LoginUserUseCaseResult = Tokens;

export class LoginUserCommand {
  constructor(public payload: CommandPayload) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async verifyUser(dto: VerifyUserDto): Promise<UserView> {
    const existedUser = await this.usersRepository.findByLoginOrEmail(
      dto.loginOrEmail,
    );

    if (!existedUser || existedUser.banInfo.isBanned) {
      throw new UnauthorizedException('Unauthorized');
    }

    const userEntity = new UsersEntity(existedUser);

    const passwordIsValid = await userEntity.comparePassword(dto.password);

    if (!passwordIsValid || !userEntity.id) {
      throw new UnauthorizedException('Unauthorized');
    }

    return userEntity.toView();
  }

  async execute(command: LoginUserCommand): Promise<LoginUserUseCaseResult> {
    const verifiedUser = await this.verifyUser(command.payload);

    const { accessToken, refreshToken } = await this.authService.generateTokens(
      {
        userId: verifiedUser.id,
        login: verifiedUser.login,
        email: verifiedUser.email,
        ip: command.payload.ip,
        title: command.payload.userAgent,
      },
    );

    return { accessToken, refreshToken };
  }
}
