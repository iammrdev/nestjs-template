import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { RecoveryRepository } from '../repository/recovery.repository';
import { UsersRepository } from '../../users/repository/users.repository';
import { UserView, UsersEntity } from '../../users/service/users.entity';

type CommandPayload = {
  newPassword: string;
  recoveryCode: string;
};

export class GenerateNewPasswordCommand {
  constructor(public payload: CommandPayload) {}
}

export type GenerateNewPasswordUseCaseResult = UserView;

@CommandHandler(GenerateNewPasswordCommand)
export class GenerateNewPasswordUseCase
  implements ICommandHandler<GenerateNewPasswordCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly recoveryRepository: RecoveryRepository,
  ) {}

  async execute(
    command: GenerateNewPasswordCommand,
  ): Promise<GenerateNewPasswordUseCaseResult> {
    const recovery = await this.recoveryRepository.findByCode(
      command.payload.recoveryCode,
    );

    if (!recovery) {
      throw new BadRequestException('Bad request');
    }

    const existedUser = await this.usersRepository.findById(recovery.userId);

    if (!existedUser) {
      throw new BadRequestException('User does not exist');
    }

    const entity = await new UsersEntity(existedUser).setPassword(
      command.payload.newPassword.toString(),
    );

    const updatedUser = await this.usersRepository.updateById(
      recovery.userId,
      entity.toModel(),
    );

    if (!updatedUser) {
      throw new InternalServerErrorException('Incorrect update user data');
    }

    return updatedUser;
  }
}
