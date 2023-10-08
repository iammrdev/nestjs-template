import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserDto, GetUsersQuery } from './users.controller.types';
import { UsersService } from '../service/users.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { BasicGuard } from '../../../app/auth-basic/basic.strategy';
import { CreateUserCommand } from '../use-case/create-user-use-case';
import { UsersQueryRepository } from '../repository/users.query.repository';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post()
  @UseGuards(BasicGuard)
  async createUser(@Body() dto: CreateUserDto) {
    const createdUser = await this.commandBus.execute(
      new CreateUserCommand(dto),
    );

    return {
      id: createdUser.id,
      login: createdUser.login,
      email: createdUser.email,
      createdAt: createdUser.createdAt,
    };
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get()
  async getUsers(@Query() query: GetUsersQuery) {
    return this.usersQueryRepository.findAllBase(query);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  @Delete(':id')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
  }
}
