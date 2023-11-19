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
import { BlogsService } from '../service/blogs.service';
import { PostsService } from '../../posts';
import { BasicGuard } from '../../../app/auth-basic/basic.strategy';
import { JwtAccessTokenInfo } from '../../../app/auth-jwt-access/jwt-access-token.info';
import { CurrentUser } from '../../../core/pipes/current-user.pipe';
import { AccessTokenUserInfo } from '../../../app/auth-jwt-access/jwt-access-token.strategy';
import { BlogsQueryRepository } from '../repository/blogs.query.repository';
import {
  PostDto,
  PostPostsByIdDto,
  GetQuery,
  PutByIdDto,
  GetPostsByIdQuery,
} from './blogs.controller.dto';
import {
  GetRdo,
  GetByIdRdo,
  GetPostsByIdRdo,
  PostRdo,
  PostPostsByIdRdo,
} from './blogs.controller.rdo';

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
  async createBlog(@Body() dto: PostDto): Promise<PostRdo> {
    return this.blogsService.createBlog(dto);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get()
  async getBlogs(@Query() query: GetQuery): Promise<GetRdo> {
    return this.blogsQueryRepository.findAllBlogs(query);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Get(':id')
  async getBlog(@Param('id') id: string): Promise<GetByIdRdo> {
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
  async updateBlog(
    @Param('id') id: string,
    @Body() dto: PutByIdDto,
  ): Promise<void> {
    await this.blogsService.updateBlog(id, dto);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Delete(':id')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    await this.blogsService.deleteBlog(id);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get(':id/posts')
  @UseGuards(JwtAccessTokenInfo)
  async getPostsByBlog(
    @CurrentUser() user: AccessTokenUserInfo,
    @Param('id') id: string,
    @Query() query: GetPostsByIdQuery,
  ): Promise<GetPostsByIdRdo> {
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
  async createPostByBlog(
    @Param('id') id: string,
    @Body() dto: PostPostsByIdDto,
  ): Promise<PostPostsByIdRdo> {
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
