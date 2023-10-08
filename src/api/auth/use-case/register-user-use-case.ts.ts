import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailService } from '../../../app/emails/email.service';
import { UsersRepository } from '../../users/repository/users.repository';
import { BadRequestException } from '@nestjs/common';
import { createUserEntity } from '../../users/service/users.entity';

type CommandPayload = {
  login: string;
  password: string;
  email: string;
};

export class VerifyUserDto {
  public loginOrEmail: string;
  public password: string;
}

export class RegisterUserCommand {
  constructor(public payload: CommandPayload) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: RegisterUserCommand) {
    // #note: для того, чтобы выводить ошибку по полю "field"
    const [userByEmail, userByLogin] = await Promise.all([
      this.usersRepository.findByLoginOrEmail(command.payload.email),
      this.usersRepository.findByLoginOrEmail(command.payload.login),
    ]);

    if (userByEmail) {
      throw new BadRequestException({
        errorsMessages: [{ message: 'User existed', field: 'email' }],
      });
    }

    if (userByLogin) {
      throw new BadRequestException({
        errorsMessages: [{ message: 'User existed', field: 'login' }],
      });
    }

    const entity = await createUserEntity(command.payload);

    const { id } = await this.usersRepository.create(entity.toModel());

    const createdUser = entity.setId(id).toView();

    await EmailService.sendEmail({
      email: createdUser.email,
      code: createdUser.confirmation.code,
    });
  }
}
