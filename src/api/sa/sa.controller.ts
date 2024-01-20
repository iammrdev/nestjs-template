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
  PostBlogsDto,
  PutBlogsByIdDto,
  PostPostsByBlogIdDto,
  GetPostsByBlogIdQuery,
  PutPostsByBlogIdDto,
} from './sa.controller.dto';
import {
  GetBlogsRdo,
  GetPostsByBlogIdRdo,
  GetUsersRdo,
  PostBlogsRdo,
  PostPostsByBlogIdRdo,
  PostUsersRdo,
} from './sa.controller.rdo';
import omit from 'lodash.omit';
import { BlogsService } from '../blogs';
import { AccessTokenUserInfo } from 'src/app/auth-jwt-access/jwt-access-token.strategy';
import { CurrentUser } from 'src/core/pipes/current-user.pipe';
import { PostsService } from '../posts';

@ApiTags('sa')
@Controller('sa')
export class SuperAdminController {
  constructor(
    private commandBus: CommandBus,
    private readonly usersService: UsersService,
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
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
  @Delete('users/:userId')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('userId') userId: string): Promise<void> {
    await this.usersService.deleteUser(userId);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Put('users/:userId/ban')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUser(
    @Param('userId') userId: string,
    @Body() dto: PutBanByUserDto,
  ): Promise<void> {
    await this.commandBus.execute(new BanUserCommand({ userId, ...dto }));
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post('blogs')
  @UseGuards(BasicGuard)
  async createBlog(@Body() dto: PostBlogsDto): Promise<PostBlogsRdo> {
    return this.blogsService.createBlog(dto);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get('blogs')
  @UseGuards(BasicGuard)
  async getBlogs(@Query() query: GetBlogsQuery): Promise<GetBlogsRdo> {
    return this.blogsQueryRepository.findAllBlogsExtended(query);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Put('blogs/:blogId')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('blogId') blogId: string,
    @Body() dto: PutBlogsByIdDto,
  ): Promise<void> {
    await this.blogsService.updateBlog(blogId, dto);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Delete('blogs/:blogId')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('blogId') blogId: string): Promise<void> {
    await this.blogsService.deleteBlog(blogId);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get('blogs/:blogId/posts')
  @UseGuards(BasicGuard)
  async getPostsByBlog(
    @CurrentUser() user: AccessTokenUserInfo,
    @Param('blogId') blogId: string,
    @Query() query: GetPostsByBlogIdQuery,
  ): Promise<GetPostsByBlogIdRdo> {
    const existedBlog = await this.blogsService.getBlogById(blogId);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    return this.postsService.getPostsByBlog(blogId, query, {
      user: {
        id: user.id,
        login: user.login,
      },
    });
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post('blogs/:blogId/posts')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPostByBlog(
    @Param('blogId') blogId: string,
    @Body() dto: PostPostsByBlogIdDto,
  ): Promise<PostPostsByBlogIdRdo> {
    const existedBlog = await this.blogsService.getBlogById(blogId);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    return this.postsService.createPost({
      ...dto,
      blogId,
      blogName: existedBlog.name,
    });
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @Put('blogs/:blogId/posts/:postId')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostByBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() dto: PutPostsByBlogIdDto,
  ): Promise<void> {
    const existedBlog = await this.blogsService.getBlogById(blogId);
    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    await this.postsService.updatePost(postId, {
      ...dto,
      blogId,
      blogName: existedBlog.name,
    });
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Delete('blogs/:blogId/posts/:postId')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    const existedBlog = await this.blogsService.getBlogById(blogId);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    await this.postsService.deletePostById(postId);
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
  @Put('blogs/:blogId/ban')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async banBlog(
    @Param('blogId') blogId: string,
    @Body() dto: PutBanByBlogDto,
  ): Promise<void> {
    await this.commandBus.execute(new BanBlogCommand({ blogId, ...dto }));
  }
}
