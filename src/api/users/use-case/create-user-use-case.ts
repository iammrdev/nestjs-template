import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../repository/users.repository';
import { UserView, createUserEntity } from '../service/users.entity';

type CommandPayload = {
  login: string;
  password: string;
  email: string;
};

export type CreateUserUseCaseResult = UserView;

export class CreateUserCommand {
  constructor(public payload: CommandPayload) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  implements ICommandHandler<CreateUserCommand, UserView>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: CreateUserCommand): Promise<CreateUserUseCaseResult> {
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

    return entity.setId(id).toView();
  }
}
