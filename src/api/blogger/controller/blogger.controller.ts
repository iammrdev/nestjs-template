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
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateBlogDto,
  CreatePostDto,
  GetBlogsQuery,
  UpdateBlogDto,
  UpdatePostDto,
} from './blogger.controller.interface';
import { GetPostsQuery, PostsService } from '../../posts';
import { JwtAccessTokenGuard } from '../../../app/auth-jwt-access/jwt-access-token.guard';
import { CurrentUser } from '../../../core/pipes/current-user.pipe';
import { AccessTokenUserInfo } from '../../../app/auth-jwt-access/jwt-access-token.strategy';
import { BlogsService } from '../../blogs';

@ApiTags('blogger')
@Controller('blogger/blogs')
export class BloggerController {
  constructor(
    private readonly blogsService: BlogsService,
    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService,
  ) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post()
  @UseGuards(JwtAccessTokenGuard)
  async createBlog(
    @CurrentUser() user: AccessTokenUserInfo,
    @Body() dto: CreateBlogDto,
  ) {
    return this.blogsService.createBlog(dto, user);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get()
  @UseGuards(JwtAccessTokenGuard)
  async getBlogs(
    @CurrentUser() user: AccessTokenUserInfo,
    @Query() query: GetBlogsQuery,
  ) {
    return this.blogsService.getBlogsByOwner(user, query);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Put(':id')
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @CurrentUser() user: AccessTokenUserInfo,
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
  ) {
    const existedBlog = await this.blogsService.getBlogByIdWithOwnerInfo(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    console.log({ user, existedBlog });

    if (
      existedBlog.blogOwnerInfo &&
      existedBlog.blogOwnerInfo.userId !== user.id
    ) {
      throw new ForbiddenException('Forbidden action for this blog');
    }

    await this.blogsService.updateBlog(id, dto);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Delete(':id')
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @CurrentUser() user: AccessTokenUserInfo,
    @Param('id') id: string,
  ) {
    const existedBlog = await this.blogsService.getBlogByIdWithOwnerInfo(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    if (
      existedBlog.blogOwnerInfo &&
      existedBlog.blogOwnerInfo.userId !== user.id
    ) {
      throw new ForbiddenException('Forbidden action for this blog');
    }

    await this.blogsService.deleteBlogById(id);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get(':id/posts')
  @UseGuards(JwtAccessTokenGuard)
  async getPostsByBlog(
    @CurrentUser() user: AccessTokenUserInfo,
    @Param('id') id: string,
    @Query() query: GetPostsQuery,
  ) {
    const existedBlog = await this.blogsService.getBlogByIdWithOwnerInfo(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    if (
      existedBlog.blogOwnerInfo &&
      existedBlog.blogOwnerInfo.userId !== user.id
    ) {
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
  @Post(':id/posts')
  @UseGuards(JwtAccessTokenGuard)
  async createPostByBlog(
    @CurrentUser() user: AccessTokenUserInfo,
    @Param('id') id: string,
    @Body() dto: CreatePostDto,
  ) {
    const existedBlog = await this.blogsService.getBlogByIdWithOwnerInfo(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    if (
      existedBlog.blogOwnerInfo &&
      existedBlog.blogOwnerInfo.userId !== user.id
    ) {
      throw new ForbiddenException('Forbidden action for this blog');
    }

    return this.postsService.createPost(
      {
        ...dto,
        blogId: id,
        blogName: existedBlog.name,
      },
      user,
    );
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Put(':id/posts/:postId')
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostByBlog(
    @CurrentUser() user: AccessTokenUserInfo,
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Body() dto: UpdatePostDto,
  ) {
    const existedBlog = await this.blogsService.getBlogByIdWithOwnerInfo(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    if (
      existedBlog.blogOwnerInfo &&
      existedBlog.blogOwnerInfo.userId !== user.id
    ) {
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
  @Delete(':id/posts/:postId')
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostByBlog(
    @CurrentUser() user: AccessTokenUserInfo,
    @Param('id') id: string,
    @Param('postId') postId: string,
  ) {
    const existedBlog = await this.blogsService.getBlogByIdWithOwnerInfo(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    if (
      existedBlog.blogOwnerInfo &&
      existedBlog.blogOwnerInfo.userId !== user.id
    ) {
      throw new ForbiddenException('Forbidden action for this blog');
    }

    return this.postsService.deletePostById(postId, user);
  }
}
