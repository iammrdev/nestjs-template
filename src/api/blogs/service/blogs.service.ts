import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Blog, BlogExtended } from '../../../types/blogs';
import { BlogsRepository } from '../repository/blogs.repository';
import { UpdateBlogDto } from '../controller/blogs.controller.types';
import { BlogUsersRepository } from '../repository/blog-users.repository';
import { BlogsEntity } from './blogs.entity';
import { CreateBlogDto, UserData } from './blogs.service.types';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogUsersRepository: BlogUsersRepository,
  ) {}

  async createBlog(dto: CreateBlogDto, user?: UserData): Promise<Blog> {
    const entity = new BlogsEntity({
      ...dto,
      blogOwnerInfo: user ? { userId: user.id, userLogin: user.login } : null,
      banInfo: { isBanned: false, banDate: null },
      createdAt: new Date(),
    });

    return this.blogsRepository.create(entity.toModel());
  }

  async getBlogById(id: string): Promise<Blog | null> {
    return this.blogsRepository.findById(id);
  }

  async getExtendedBlogById(id: string): Promise<BlogExtended | null> {
    return this.blogsRepository.findByIdExtended(id);
  }

  async updateBlog(
    id: string,
    dto: UpdateBlogDto,
    params?: { user?: UserData },
  ): Promise<Blog | null> {
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

    const entity = new BlogsEntity({ ...existedBlog, ...dto });

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

  async checkUserBanByBlog(blogId: string, userId: string) {
    const user = await this.blogUsersRepository.findUserByBlog(blogId, userId);

    return Boolean(user);
  }
}
