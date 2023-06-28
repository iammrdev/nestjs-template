import { Injectable } from '@nestjs/common';
import {
  CreateBlogDto,
  GetBlogsQuery,
  UserData,
} from './blogs.service.interface';
import { Blog } from '../../../types/blogs';
import { BlogsRepository } from '../repository/blogs.repository';
import { BlogsEntity } from './blogs.entity';
import { UpdateBlogDto } from '../controller/blogs.controller.interface';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async createBlog(dto: CreateBlogDto, user?: UserData): Promise<Blog> {
    const entity = new BlogsEntity({
      ...dto,
      createdAt: new Date(),
    }).setOwnerInfo(user && { userId: user?.id, userLogin: user?.login });

    return this.blogsRepository.create(entity);
  }

  async getBlogs(query: GetBlogsQuery) {
    return this.blogsRepository.findAll(query);
  }

  async getBlogsByOwner(user: UserData, query: GetBlogsQuery) {
    return this.blogsRepository.findAllByUser(user, query);
  }

  async getBlogsWithOwnerInfo(query: GetBlogsQuery) {
    return this.blogsRepository.findAllWithOwnerInfo(query);
  }

  async getBlogById(id: string): Promise<Blog | null> {
    return this.blogsRepository.findById(id);
  }

  async getBlogByIdWithOwnerInfo(id: string): Promise<Blog | null> {
    return this.blogsRepository.findByIdWithOwnerInfo(id);
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
