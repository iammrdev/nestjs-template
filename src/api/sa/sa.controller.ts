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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { UsersService } from '../users';
import {
  BanBlogDto,
  BanUserDto,
  CreateUserDto,
  GetBlogsQuery,
  GetUsersQuery,
} from './sa.controller.interface';
import { BasicGuard } from '../../app/auth-basic/basic.strategy';
import { BlogsService } from '../blogs';
import { CommandBus } from '@nestjs/cqrs';
import { BanUserCommand } from './BanUserUseCase';
import { BindUserWithBlogCommand } from './BindUserWithBlogUseCase';
import { BanBlogCommand } from './BanBlogUseCase';

@ApiTags('sa')
@Controller('sa')
export class SuperAdminController {
  constructor(
    private commandBus: CommandBus,
    private readonly usersService: UsersService,
    private readonly blogsService: BlogsService,
  ) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post('users')
  @UseGuards(BasicGuard)
  async createUser(@Body() dto: CreateUserDto) {
    const createdUser = await this.usersService.createUser(dto);

    return {
      id: createdUser.id,
      login: createdUser.login,
      email: createdUser.email,
      createdAt: createdUser.createdAt,
      banInfo: createdUser.banInfo,
    };
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get('users')
  @UseGuards(BasicGuard)
  async getUsers(@Query() query: GetUsersQuery) {
    return this.usersService.getUsersWithBanInfo(query);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  @Delete('users/:id')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    const existedUser = await this.usersService.getUserById(id);

    if (!existedUser) {
      throw new NotFoundException('User is not found');
    }

    await this.usersService.deleteUserById(id);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Put('users/:id/ban')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUser(@Param('id') id: string, @Body() dto: BanUserDto) {
    await this.commandBus.execute(new BanUserCommand({ userId: id, ...dto }));
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get('blogs')
  @UseGuards(BasicGuard)
  async getBlogs(@Query() query: GetBlogsQuery) {
    return this.blogsService.getBlogsWithOwnerInfo(query);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Put('blogs/:blogId/bind-with-user/:userId')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async bindBlogByUser(
    @Param('blogId') blogId: string,
    @Param('userId') userId: string,
  ) {
    await this.commandBus.execute(
      new BindUserWithBlogCommand({ userId, blogId }),
    );
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Put('blogs/:id/ban')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async banBlog(@Param('id') id: string, @Body() dto: BanBlogDto) {
    await this.commandBus.execute(new BanBlogCommand({ blogId: id, ...dto }));
  }
}
