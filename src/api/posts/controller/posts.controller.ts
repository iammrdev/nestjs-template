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
  forwardRef,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostsService } from '../service/posts.service';
import {
  CreatePostDto,
  GetPostsQuery,
  UpdatePostDto,
} from './posts.controller.interface';
import { BlogsService } from '../../blogs';
import { CommentsService, GetCommentsQuery } from '../../comments';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    @Inject(forwardRef(() => BlogsService))
    private readonly blogsService: BlogsService,
    private readonly commentsService: CommentsService,
  ) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post()
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
  async getPosts(@Query() query: GetPostsQuery) {
    return this.postsService.getPosts(query);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Get(':id')
  async getPost(@Param('id') id: string) {
    const existedPost = await this.postsService.getPostById(id);

    if (!existedPost) {
      throw new NotFoundException('Post is not found');
    }

    return existedPost;
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Put(':id')
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

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string) {
    const existedPost = await this.postsService.getPostById(id);

    if (!existedPost) {
      throw new NotFoundException('Post is not found');
    }

    await this.postsService.deletePostById(id);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get(':id/comments')
  async getPostsByBlog(
    @Param('id') id: string,
    @Query() query: GetCommentsQuery,
  ) {
    const existedPost = await this.postsService.getPostById(id);

    if (!existedPost) {
      throw new NotFoundException('Post is not found');
    }

    return this.commentsService.getCommentByPost(id, query);
  }
}