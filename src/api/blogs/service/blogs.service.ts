import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppBlog, AppBlogExtended } from '../../../types/blogs';
import { BlogsRepository } from '../repository/blogs.repository';
import { BlogsEntity } from './blogs.entity';
import {
  CreateBlogParams,
  UpdateBlogParams,
  UserData,
} from './blogs.service.types';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async createBlog(
    params: CreateBlogParams,
    user?: UserData,
  ): Promise<AppBlog> {
    const entity = new BlogsEntity({
      ...params,
      blogOwnerInfo: user ? { userId: user.id, userLogin: user.login } : null,
      banInfo: { isBanned: false, banDate: null },
      createdAt: new Date(),
    });

    return this.blogsRepository.create(entity.toModel());
  }

  async getBlogById(id: string): Promise<AppBlog | null> {
    return this.blogsRepository.findById(id);
  }

  async getExtendedBlogById(id: string): Promise<AppBlogExtended | null> {
    return this.blogsRepository.findByIdExtended(id);
  }

  async updateBlog(
    id: string,
    params: UpdateBlogParams,
    options?: { user?: UserData },
  ): Promise<AppBlog | null> {
    const existedBlog = await this.getExtendedBlogById(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    if (
      options?.user?.id &&
      options?.user?.id !== existedBlog.blogOwnerInfo?.userId
    ) {
      throw new ForbiddenException('Forbidden action for this blog');
    }

    const entity = new BlogsEntity({ ...existedBlog, ...params });

    return this.blogsRepository.updateById(id, entity.toModel());
  }

  async deleteBlog(id: string, params?: { user?: UserData }): Promise<void> {
    const existedBlog = await this.getExtendedBlogById(id);

    if (!existedBlog) {
      throw new NotFoundException('Blog is not found');
    }

    if (
      params?.user?.id &&
      params?.user?.id !== existedBlog.blogOwnerInfo?.userId
    ) {
      throw new ForbiddenException('Forbidden action for this blog');
    }

    await this.blogsRepository.deleteById(id);
  }

  async deleteAll(): Promise<void> {
    await this.blogsRepository.deleteAll();
  }
}
