import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import isAfter from 'date-fns/isAfter';
import { UsersRepository } from '../../users/repository/users.repository';
import { UserView, UsersEntity } from '../../users/service/users.entity';

type CommandPayload = {
  code: string;
};

export type ConfirmRegistrationUseCaseResult = UserView;

export class ConfirmRegistrationCommand {
  constructor(public payload: CommandPayload) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase
  implements ICommandHandler<ConfirmRegistrationCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(
    command: ConfirmRegistrationCommand,
  ): Promise<ConfirmRegistrationUseCaseResult> {
    const existedUser = await this.usersRepository.findByConfirmationCode(
      command.payload.code,
    );

    if (!existedUser) {
      throw new BadRequestException({
        errorsMessages: [{ message: 'Invalid code', field: 'code' }],
      });
    }

    const isExpired = isAfter(new Date(), existedUser.confirmation.expiration);

    if (
      isExpired ||
      existedUser.confirmation.code !== command.payload.code ||
      existedUser.confirmation.status
    ) {
      throw new BadRequestException({
        errorsMessages: [{ message: 'Invalid code', field: 'code' }],
      });
    }

    const entity = new UsersEntity(existedUser).activate();

    const updatedUser = await this.usersRepository.updateById(
      existedUser.id,
      entity.toModel(),
    );

    if (!updatedUser) {
      throw new InternalServerErrorException('Incorrect update user data');
    }

    return updatedUser;
  }
}
