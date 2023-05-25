import {
  Body,
  Controller,
  Delete,
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
import { PostsService } from '../service/posts.service';
import {
  CreateCommentDto,
  CreatePostDto,
  GetPostsQuery,
  UpdatePostDto,
  UpdatePostLikeStatusDto,
} from './posts.controller.interface';
import { BlogsService } from '../../blogs';
import { CommentsService, GetCommentsQuery } from '../../comments';
import { BasicGuard } from '../../auth/jwt/basic.strategy';
import { JwtAccessTokenGuard } from '../../auth/jwt/jwt-access-token.guard';
import { CurrentUser, CurrentUserId } from '../../auth/jwt/current-user.pipe';
import { UsersService } from '../../users';
import { JwtAccessTokenInfo } from '../../auth/jwt/jwt-access-token.info';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    @Inject(forwardRef(() => BlogsService))
    private readonly blogsService: BlogsService,
    private readonly commentsService: CommentsService,
    private readonly usersService: UsersService,
  ) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post()
  @UseGuards(BasicGuard)
  async createPost(@Body() dto: CreatePostDto) {
    const existedBlog = await this.blogsService.getBlogById(dto.blogId);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    return this.postsService.createPost({
      ...dto,
      blogName: existedBlog.name,
    });
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get()
  @UseGuards(JwtAccessTokenInfo)
  async getPosts(@CurrentUser() user: any, @Query() query: GetPostsQuery) {
    return this.postsService.getPosts(query, { user });
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Get(':id')
  @UseGuards(JwtAccessTokenInfo)
  async getPost(@CurrentUser() user: any, @Param('id') id: string) {
    console.log({ user });
    const existedPost = await this.postsService.getPostById(id, { user });

    if (!existedPost) {
      throw new NotFoundException('Post is not found');
    }

    return existedPost;
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Put(':id')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    const existedBlog = await this.blogsService.getBlogById(dto.blogId);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    await this.postsService.updatePost(id, {
      ...dto,
      blogName: existedBlog.name,
    });
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Put(':id/like-status')
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostLikeStatus(
    @CurrentUserId() currentUserId: any,
    @Param('id') id: string,
    @Body() dto: UpdatePostLikeStatusDto,
  ) {
    const existedUser = await this.usersService.getUserById(currentUserId);

    if (!existedUser) {
      throw new NotFoundException('User is not found');
    }

    return this.postsService.updatePostLikeStatusById(
      id,
      {
        likeStatus: dto.likeStatus,
      },
      {
        id: existedUser.id,
        login: existedUser.login,
      },
    );
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Delete(':id')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string) {
    await this.postsService.deletePostById(id);
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post(':id/comments')
  @UseGuards(JwtAccessTokenGuard)
  async createCommenyByPost(
    @CurrentUserId() currentUserId: string,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    const existedUser = await this.usersService.getUserById(currentUserId);

    if (!existedUser) {
      throw new NotFoundException('User is not found');
    }

    const existedPost = await this.postsService.getPostById(id);

    if (!existedPost) {
      throw new NotFoundException('Post is not found');
    }

    return this.commentsService.createCommentByPost(id, {
      ...dto,
      userId: existedUser.id,
      userLogin: existedUser.login,
    });
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get(':id/comments')
  @UseGuards(JwtAccessTokenInfo)
  async getPostsByBlog(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Query() query: GetCommentsQuery,
  ) {
    const existedPost = await this.postsService.getPostById(id);

    if (!existedPost) {
      throw new NotFoundException('Post is not found');
    }

    return this.commentsService.getCommentByPost(id, query, { userId });
  }
}
