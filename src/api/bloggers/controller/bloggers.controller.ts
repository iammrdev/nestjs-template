import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  PutBanByUserDto,
  PostBlogsDto,
  PostPostsByBlogIdDto,
  PutBlogsByIdDto,
  PutPostByBlogDto,
  GetBlogsQuery,
  GetUsersByBlogQuery,
  GetUserCommentsQuery,
  GetPostsByBlogIdQuery,
} from './bloggers.controller.dto';
import { PostsService } from '../../posts';
import { JwtAccessTokenGuard } from '../../../app/auth-jwt-access/jwt-access-token.guard';
import { CurrentUser } from '../../../core/pipes/current-user.pipe';
import { AccessTokenUserInfo } from '../../../app/auth-jwt-access/jwt-access-token.strategy';
import { BlogsService } from '../../blogs';
import { BanBlogUserCommand } from '../use-case/BanBlogUserUseCase';
import {
  GetAllCommentsByUserCommand,
  GetAllCommentsByUserUseCaseResult,
} from '../use-case/GetAllCommentsByUserUseCase';
import {
  GetUsersByBlogCommand,
  GetUsersByBlogUseCaseResult,
} from '../use-case/GetUsersByBlogUseCase';
import { BlogsQueryRepository } from '../../blogs/repository/blogs.query.repository';
import {
  GetBlogsRdo,
  GetCommentsRdo,
  GetPostsByBlogIdRdo,
  GetUsersByBlogRdo,
  PostBlogsRdo,
  PostPostsByBlogIdRdo,
  PutPostByBlogRdo,
} from './bloggers.controller.rdo';

@ApiTags('blogger')
@Controller('blogger')
export class BloggerController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsService: BlogsService,
    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post('blogs')
  @UseGuards(JwtAccessTokenGuard)
  async createBlog(
    @CurrentUser() user: AccessTokenUserInfo,
    @Body() dto: PostBlogsDto,
  ): Promise<PostBlogsRdo> {
    return this.blogsService.createBlog(dto, user);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get('blogs')
  @UseGuards(JwtAccessTokenGuard)
  async getBlogs(
    @CurrentUser() user: AccessTokenUserInfo,
    @Query() query: GetBlogsQuery,
  ): Promise<GetBlogsRdo> {
    return this.blogsQueryRepository.findAllByUserWithPagination(
      user.id,
      query,
    );
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Put('blogs/:id')
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @CurrentUser() user: AccessTokenUserInfo,
    @Param('id') id: string,
    @Body() dto: PutBlogsByIdDto,
  ): Promise<void> {
    await this.blogsService.updateBlog(id, dto, { user });
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Delete('blogs/:id')
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @CurrentUser() user: AccessTokenUserInfo,
    @Param('id') id: string,
  ): Promise<void> {
    await this.blogsService.deleteBlog(id, { user });
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get('blogs/:id/posts')
  @UseGuards(JwtAccessTokenGuard)
  async getPostsByBlog(
    @CurrentUser() user: AccessTokenUserInfo,
    @Param('id') id: string,
    @Query() query: GetPostsByBlogIdQuery,
  ): Promise<GetPostsByBlogIdRdo> {
    const existedBlog = await this.blogsService.getExtendedBlogById(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    if (existedBlog.blogOwnerInfo?.userId !== user.id) {
      throw new ForbiddenException('Forbidden action for this blog');
    }

    return this.postsService.getPostsByBlog(id, query, {
      user: {
        id: user.id,
        login: user.login,
      },
    });
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post('blogs/:id/posts')
  @UseGuards(JwtAccessTokenGuard)
  async createPostByBlog(
    @CurrentUser() user: AccessTokenUserInfo,
    @Param('id') id: string,
    @Body() dto: PostPostsByBlogIdDto,
  ): Promise<PostPostsByBlogIdRdo> {
    const existedBlog = await this.blogsService.getExtendedBlogById(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    if (existedBlog.blogOwnerInfo?.userId !== user.id) {
      throw new ForbiddenException('Forbidden action for this blog');
    }

    return this.postsService.createPost(
      {
        ...dto,
        blogId: id,
        blogName: existedBlog.name,
      },
      user.id,
    );
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Put('blogs/:id/posts/:postId')
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostByBlog(
    @CurrentUser() user: AccessTokenUserInfo,
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Body() dto: PutPostByBlogDto,
  ): Promise<PutPostByBlogRdo> {
    const existedBlog = await this.blogsService.getExtendedBlogById(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    if (existedBlog.blogOwnerInfo?.userId !== user.id) {
      throw new ForbiddenException('Forbidden action for this blog');
    }

    return this.postsService.updatePost(
      postId,
      {
        ...dto,
        blogId: id,
        blogName: existedBlog.name,
      },
      user,
    );
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Delete('blogs/:id/posts/:postId')
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostByBlog(
    @CurrentUser() user: AccessTokenUserInfo,
    @Param('id') id: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    const existedBlog = await this.blogsService.getExtendedBlogById(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    if (existedBlog.blogOwnerInfo?.userId !== user.id) {
      throw new ForbiddenException('Forbidden action for this blog');
    }

    await this.postsService.deletePostById(postId, user);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Put('users/:id/ban')
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async banBlog(
    @CurrentUser() user: AccessTokenUserInfo,
    @Param('id') id: string,
    @Body() dto: PutBanByUserDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new BanBlogUserCommand({
        bannedUserId: id,
        ownerId: user.id,
        banInfo: {
          banReason: dto.banReason,
          isBanned: dto.isBanned,
        },
        blogId: dto.blogId,
      }),
    );
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get('users/blog/:id')
  @UseGuards(JwtAccessTokenGuard)
  async getBannedUsers(
    @CurrentUser() user: AccessTokenUserInfo,
    @Param('id') id: string,
    @Query() query: GetUsersByBlogQuery,
  ): Promise<GetUsersByBlogRdo> {
    const existedBlog = await this.blogsService.getExtendedBlogById(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    if (existedBlog.blogOwnerInfo?.userId !== user.id) {
      throw new ForbiddenException('Forbidden action for this blog');
    }

    const result: GetUsersByBlogUseCaseResult = await this.commandBus.execute(
      new GetUsersByBlogCommand({
        blogId: id,
        isBanned: true,
        params: query,
      }),
    );

    return result;
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get('blogs/comments')
  @UseGuards(JwtAccessTokenGuard)
  async getComments(
    @CurrentUser() user: AccessTokenUserInfo,
    @Query() query: GetUserCommentsQuery,
  ): Promise<GetCommentsRdo> {
    const result: GetAllCommentsByUserUseCaseResult =
      await this.commandBus.execute(
        new GetAllCommentsByUserCommand({
          userId: user.id,
          query,
        }),
      );

    return result;
  }
}
