import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { UsersEntity } from '../../users/service/users.entity';
import { UsersRepository } from '../../users/repository/users.repository';
import { AuthService } from '../service/auth.service';

type CommandPayload = {
  loginOrEmail: string;
  password: string;
  ip: string;
  userAgent: string;
};

export class VerifyUserDto {
  public loginOrEmail: string;
  public password: string;
}

export class LoginUserCommand {
  constructor(public payload: CommandPayload) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async verifyUser(dto: VerifyUserDto) {
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

    return {
      userId: userEntity.id,
      login: userEntity.login,
      email: userEntity.email,
      createdAt: userEntity.createdAt,
    };
  }

  async execute(command: LoginUserCommand) {
    const verifiedUser = await this.verifyUser(command.payload);

    const { accessToken, refreshToken } =
      await this.authService.generateAuthInfo({
        ...verifiedUser,
        ip: command.payload.ip,
        title: command.payload.userAgent,
      });

    return { accessToken, refreshToken };
  }
}
