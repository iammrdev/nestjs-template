import { Injectable } from '@nestjs/common';
import { CreateBlogDto, GetBlogsQuery } from './blogs.service.interface';
import { Blog } from '../../../types/blogs';
import { BlogsRepository } from '../repository/blogs.repository';
import { BlogsEntity } from './blogs.entity';
import { UpdateBlogDto } from '../controller/blogs.controller.interface';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async createBlog(dto: CreateBlogDto): Promise<Blog> {
    const entity = new BlogsEntity({ ...dto, createdAt: new Date() });

    return this.blogsRepository.create(entity);
  }

  async getBlogs(query: GetBlogsQuery) {
    return this.blogsRepository.findAll(query);
  }

  async getBlogById(id: string): Promise<Blog | null> {
    console.log(id);
    return this.blogsRepository.findById(id);
  }

  async updateBlog(id: string, dto: UpdateBlogDto): Promise<Blog | null> {
    const entity = new BlogsEntity(dto);

    return this.blogsRepository.updateById(id, entity);
  }

  async deleteBlogById(id: string): Promise<{ status: 'ok' }> {
    await this.blogsRepository.deleteById(id);

    return { status: 'ok' };
  }

  async deleteAll(): Promise<void> {
    await this.blogsRepository.deleteAll();
  }
}
