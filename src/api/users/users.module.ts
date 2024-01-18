import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersModel, UsersSchema } from './repository/mongodb/users.model';
import { UsersService } from './service/users.service';
import { UsersController } from './controller/users.controller';
import { UsersRepository } from './repository';
import { CreateUserUseCase } from './use-case/create-user-use-case';
import { UsersQueryRepository } from './repository';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: UsersModel.name, schema: UsersSchema }]),
  ],
  exports: [UsersRepository, UsersQueryRepository, UsersService],
  controllers: [UsersController],
  providers: [
    UsersRepository,
    UsersQueryRepository,
    UsersService,
    CreateUserUseCase,
  ],
})
export class UsersModule {}
