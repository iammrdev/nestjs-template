import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EmailService } from '../../../app/emails/email.service';
import { UsersRepository } from '../../users/repository/users.repository';
import { UsersEntity } from '../../users/service/users.entity';

type CommandPayload = {
  email: string;
};

export class ResendRegistrationEmailCommand {
  constructor(public payload: CommandPayload) {}
}

@CommandHandler(ResendRegistrationEmailCommand)
export class ResendRegistrationEmailUseCase
  implements ICommandHandler<ResendRegistrationEmailCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: ResendRegistrationEmailCommand) {
    const email = command.payload.email;
    const existedUser = await this.usersRepository.findByEmail(email);

    if (!existedUser || existedUser.confirmation.status) {
      throw new BadRequestException({
        errorsMessages: [{ message: 'Invalid email', field: 'email' }],
      });
    }

    const entity = new UsersEntity(existedUser).generateConfirmation();

    const updatedUser = await this.usersRepository.updateById(
      existedUser.id,
      entity.toModel(),
    );

    if (!updatedUser) {
      throw new BadRequestException({
        errorsMessages: [{ message: 'Invalid email', field: 'email' }],
      });
    }

    const info = await EmailService.sendEmail({
      email: updatedUser.email,
      code: updatedUser.confirmation.code,
    });

    if (!info.messageId) {
      throw new InternalServerErrorException('Server error');
    }
  }
}
