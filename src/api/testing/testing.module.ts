import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { TestingService } from './testing.service';
import { UsersModule } from '../users/users.module';
import { BlogsModule } from '../blogs/blogs.module';
import { PostsModule } from '../posts/posts.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [UsersModule, BlogsModule, PostsModule, CommentsModule],
  exports: [],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
