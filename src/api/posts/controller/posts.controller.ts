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
import { PostsService } from '../service/posts.service';
import {
  PostCommentsByIdDto,
  PostDto,
  GetQuery,
  PutByIdDto,
  PutLikeStatusByIdDto,
  GetCommentsByIdQuery,
} from './posts.controller.dto';
import { BlogsService } from '../../blogs';
import { CommentsService } from '../../comments';
import { BasicGuard } from '../../../app/auth-basic/basic.strategy';
import { JwtAccessTokenGuard } from '../../../app/auth-jwt-access/jwt-access-token.guard';
import { CurrentUser } from '../../../core/pipes/current-user.pipe';
import { CurrentUserId } from '../../../core/pipes/current-user-id.pipe';
import { UsersService } from '../../users';
import { JwtAccessTokenInfo } from '../../../app/auth-jwt-access/jwt-access-token.info';
import { AccessTokenUserInfo } from '../../../app/auth-jwt-access/jwt-access-token.strategy';
import { BloggersService } from '../../bloggers/service/bloggers.service';
import {
  GetByIdRdo,
  GetCommentsByIdRdo,
  GetRdo,
  PostCommentsByIdRdo,
  PostRdo,
  PutLikeStatusByIdRdo,
} from './posts.controller.rdo';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    @Inject(forwardRef(() => BlogsService))
    private readonly blogsService: BlogsService,
    private readonly bloggersService: BloggersService,
    private readonly commentsService: CommentsService,
    private readonly usersService: UsersService,
  ) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post()
  @UseGuards(BasicGuard)
  async createPost(@Body() dto: PostDto): Promise<PostRdo> {
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
  async getPosts(
    @CurrentUser() user: AccessTokenUserInfo,
    @Query() query: GetQuery,
  ): Promise<GetRdo> {
    return this.postsService.getPosts(query, { user });
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Get(':id')
  @UseGuards(JwtAccessTokenInfo)
  async getPost(
    @CurrentUser() user: AccessTokenUserInfo,
    @Param('id') id: string,
  ): Promise<GetByIdRdo> {
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
  async updatePost(
    @Param('id') id: string,
    @Body() dto: PutByIdDto,
  ): Promise<void> {
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
    @CurrentUserId() currentUserId: string,
    @Param('id') id: string,
    @Body() dto: PutLikeStatusByIdDto,
  ): Promise<PutLikeStatusByIdRdo> {
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
  async deletePost(@Param('id') id: string): Promise<void> {
    await this.postsService.deletePostById(id);
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post(':id/comments')
  @UseGuards(JwtAccessTokenGuard)
  async createCommenyByPost(
    @CurrentUserId() currentUserId: string,
    @Param('id') id: string,
    @Body() dto: PostCommentsByIdDto,
  ): Promise<PostCommentsByIdRdo> {
    const existedUser = await this.usersService.getUserById(currentUserId);

    if (!existedUser) {
      throw new NotFoundException('User is not found');
    }

    const existedPost = await this.postsService.getPostById(id);

    if (!existedPost) {
      throw new NotFoundException('Post is not found');
    }

    const isBanned = await this.bloggersService.checkUserBanByBlog(
      existedPost.blogId,
      currentUserId,
    );

    if (isBanned) {
      throw new ForbiddenException('Forbidden');
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
    @Query() query: GetCommentsByIdQuery,
  ): Promise<GetCommentsByIdRdo> {
    const existedPost = await this.postsService.getPostById(id);

    if (!existedPost) {
      throw new NotFoundException('Post is not found');
    }

    return this.commentsService.getCommentsByPost(id, query, { userId });
  }
}
