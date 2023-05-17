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
} from '@nestjs/common';
import {
  CreateBlogDto,
  GetBlogsQuery,
  UpdateBlogDto,
} from './blogs.controller.interface';
import { BlogsService } from '../service/blogs.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post()
  async createBlog(@Body() dto: CreateBlogDto) {
    return this.blogsService.createBlog(dto);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Get()
  async getBlogs(@Query() query: GetBlogsQuery) {
    return this.blogsService.getBlogs(query);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Blog is not exists',
  })
  @Get(':id')
  async getBlog(@Param('id') id: string) {
    const existedBlog = await this.blogsService.getBlogById(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    return existedBlog;
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Blog is not exists',
  })
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    const existedBlog = await this.blogsService.getBlogById(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    await this.blogsService.updateBlog(id, dto);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Blog is not exists',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    const existedBlog = await this.blogsService.getBlogById(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    await this.blogsService.deleteBlogById(id);
  }
}
