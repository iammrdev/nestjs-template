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
import {
  CreateBlogDto,
  CreatePostDto,
  GetBlogsQuery,
  UpdateBlogDto,
} from './blogs.controller.types';
import { BlogsService } from '../service/blogs.service';
import { GetPostsQuery, PostsService } from '../../posts';
import { BasicGuard } from '../../../app/auth-basic/basic.strategy';
import { JwtAccessTokenInfo } from '../../../app/auth-jwt-access/jwt-access-token.info';
import { CurrentUser } from '../../../core/pipes/current-user.pipe';
import { AccessTokenUserInfo } from '../../../app/auth-jwt-access/jwt-access-token.strategy';
import { BlogsQueryRepository } from '../repository/blogs.query.repository';

@ApiTags('blogs')
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post()
  @UseGuards(BasicGuard)
  async createBlog(@Body() dto: CreateBlogDto) {
    return this.blogsService.createBlog(dto);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get()
  async getBlogs(@Query() query: GetBlogsQuery) {
    return this.blogsQueryRepository.findAll(query);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Get(':id')
  async getBlog(@Param('id') id: string) {
    const existedBlog = await this.blogsService.getBlogById(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    return existedBlog;
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Put(':id')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    await this.blogsService.updateBlog(id, dto);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Delete(':id')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    await this.blogsService.deleteBlog(id);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get(':id/posts')
  @UseGuards(JwtAccessTokenInfo)
  async getPostsByBlog(
    @CurrentUser() user: AccessTokenUserInfo,
    @Param('id') id: string,
    @Query() query: GetPostsQuery,
  ) {
    const existedBlog = await this.blogsService.getBlogById(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
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
  @UseGuards(BasicGuard)
  async createPostByBlog(@Param('id') id: string, @Body() dto: CreatePostDto) {
    const existedBlog = await this.blogsService.getBlogById(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    return this.postsService.createPost({
      ...dto,
      blogId: id,
      blogName: existedBlog.name,
    });
  }
}
