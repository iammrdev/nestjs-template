import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { RecoveryRepository } from '../repository/recovery.repository';
import { UsersRepository } from '../../users/repository/users.repository';
import { EmailService } from '../../../app/emails/email.service';
import { RecoveryEntity } from '../service/auth.service.interface';

type CommandPayload = {
  email: string;
  ip: string;
  userAgent: string;
};

export class RecoveryPasswordCommand {
  constructor(public payload: CommandPayload) {}
}

@CommandHandler(RecoveryPasswordCommand)
export class RecoveryPasswordUseCase
  implements ICommandHandler<RecoveryPasswordCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly recoveryRepository: RecoveryRepository,
  ) {}

  async execute(command: RecoveryPasswordCommand) {
    const user = await this.usersRepository.findByEmail(command.payload.email);

    if (!user) {
      return;
    }

    const recoveryEnitity: RecoveryEntity = {
      userId: user.id,
      deviceId: uuidv4(),
      ip: command.payload.ip,
      title: command.payload.userAgent,
      code: uuidv4(),
      iat: new Date(),
      exp: add(new Date(), { minutes: 60 }),
    };

    const recovery = await this.recoveryRepository.create(recoveryEnitity);

    const info = await EmailService.sendRecoveryEmail({
      email: user.email,
      code: recovery.code,
    });

    if (!info.messageId) {
      throw new InternalServerErrorException('Server error');
    }
  }
}
