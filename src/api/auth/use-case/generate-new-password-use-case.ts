import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { RecoveryRepository } from '../repository/recovery.repository';
import { UsersRepository } from '../../users/repository/users.repository';
import { UsersEntity } from '../../users/service/users.entity';

type CommandPayload = {
  newPassword: string;
  recoveryCode: string;
};

export class GenerateNewPasswordCommand {
  constructor(public payload: CommandPayload) {}
}

@CommandHandler(GenerateNewPasswordCommand)
export class GenerateNewPasswordUseCase
  implements ICommandHandler<GenerateNewPasswordCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly recoveryRepository: RecoveryRepository,
  ) {}

  async execute(command: GenerateNewPasswordCommand) {
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

    return this.usersRepository.updateById(recovery.userId, entity.toModel());
  }
}
