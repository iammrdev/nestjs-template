import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto, GetUsersQuery } from './users.controller.interface';
import { UsersService } from '../service/users.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { BasicGuard } from '../../auth/jwt/basic.strategy';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post()
  @UseGuards(BasicGuard)
  async createUser(@Body() dto: CreateUserDto) {
    const createdUser = await this.usersService.createUser(dto);

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
    return this.usersService.getUsers(query);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  @Delete(':id')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    const existedUser = await this.usersService.getUserById(id);

    if (!existedUser) {
      throw new NotFoundException('User is not found');
    }

    await this.usersService.deleteUserById(id);
  }
}
