import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModel, UsersSchema } from './repository/users.model';
import { UsersService } from './service/users.service';
import { UsersController } from './controller/users.controller';
import { UsersRepository } from './repository/users.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UsersModel.name, schema: UsersSchema }]),
  ],
  exports: [UsersService, UsersRepository],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
})
export class UsersModule {}
