import { Injectable } from '@nestjs/common';

import { BloggersRepository } from '../../bloggers/repository/bloggers.repository';

@Injectable()
export class BloggersService {
  constructor(private readonly bloggersRepository: BloggersRepository) {}

  async checkUserBanByBlog(blogId: string, userId: string): Promise<boolean> {
    const user = await this.bloggersRepository.findUserByBlog(blogId, userId);

    return Boolean(user);
  }
}
