import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { UsersService } from '../users';
import { BasicGuard } from '../../app/auth-basic/basic.strategy';
import { BanUserCommand } from './use-case/BanUserUseCase';
import { BindUserWithBlogCommand } from './use-case/BindUserWithBlogUseCase';
import { BanBlogCommand } from './use-case/BanBlogUseCase';
import { BlogsQueryRepository } from '../blogs/repository';
import {
  CreateUserCommand,
  CreateUserUseCaseResult,
} from '../users/use-case/create-user-use-case';
import { UsersQueryRepository } from '../users/repository';
import {
  PutBanByBlogDto,
  PutBanByUserDto,
  PostUsersDto,
  GetBlogsQuery,
  GetUsersQuery,
} from './sa.controller.dto';
import { GetBlogsRdo, GetUsersRdo, PostUsersRdo } from './sa.controller.rdo';
import omit from 'lodash.omit';

@ApiTags('sa')
@Controller('sa')
export class SuperAdminController {
  constructor(
    private commandBus: CommandBus,
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post('users')
  @UseGuards(BasicGuard)
  async createUser(@Body() dto: PostUsersDto): Promise<PostUsersRdo> {
    const result: CreateUserUseCaseResult = await this.commandBus.execute(
      new CreateUserCommand(dto),
    );

    return omit(result, ['confirmation', 'banInfo']);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get('users')
  @UseGuards(BasicGuard)
  async getUsers(@Query() query: GetUsersQuery): Promise<GetUsersRdo> {
    return this.usersQueryRepository.findAllUsers(query);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  @Delete('users/:id')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.usersService.deleteUser(id);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Put('users/:id/ban')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUser(
    @Param('id') id: string,
    @Body() dto: PutBanByUserDto,
  ): Promise<void> {
    await this.commandBus.execute(new BanUserCommand({ userId: id, ...dto }));
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get('blogs')
  @UseGuards(BasicGuard)
  async getBlogs(@Query() query: GetBlogsQuery): Promise<GetBlogsRdo> {
    return this.blogsQueryRepository.findAllBlogsExtended(query);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Put('blogs/:blogId/bind-with-user/:userId')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async bindBlogByUser(
    @Param('blogId') blogId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new BindUserWithBlogCommand({ userId, blogId }),
    );
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Put('blogs/:id/ban')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async banBlog(
    @Param('id') id: string,
    @Body() dto: PutBanByBlogDto,
  ): Promise<void> {
    await this.commandBus.execute(new BanBlogCommand({ blogId: id, ...dto }));
  }
}
