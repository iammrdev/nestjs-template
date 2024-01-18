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
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../service/users.service';
import { BasicGuard } from '../../../app/auth-basic/basic.strategy';
import { CreateUserCommand } from '../use-case/create-user-use-case';
import { UsersQueryRepository } from '../repository';
import { buildObject } from '../../../core/buildObject';
import { PostDto, GetQuery } from './users.controller.dto';
import { PostRdo, GetRdo } from './users.rdo';

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
  async createUser(@Body() dto: PostDto): Promise<PostRdo> {
    const createdUser = await this.commandBus.execute<
      CreateUserCommand,
      PostRdo
    >(new CreateUserCommand(dto));
    return buildObject(PostRdo, createdUser);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get()
  async getUsers(@Query() query: GetQuery): Promise<GetRdo> {
    return this.usersQueryRepository.findAllUsers(query);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  @Delete(':id')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.usersService.deleteUser(id);
  }
}
