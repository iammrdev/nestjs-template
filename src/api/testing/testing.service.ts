import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/service/users.service';
import { BlogsService } from '../blogs/service/blogs.service';
import { PostsService } from '../posts/service/posts.service';
import { CommentsService } from '../comments/service/comments.service';
import { AuthService } from '../auth/service/auth.service';

@Injectable()
export class TestingService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  async deleteAllData(): Promise<void> {
    await Promise.all([
      this.usersService.deleteAll(),
      this.authService.deleteAll(),
      this.blogsService.deleteAll(),
      this.postsService.deleteAll(),
      this.commentsService.deleteAll(),
    ]);
  }
}
