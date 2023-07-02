import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersModule } from '../users';
import { BlogsModule } from '../blogs';
import { AuthModule } from '../auth';
import { SuperAdminController } from './sa.controller';
import { BanUserUseCase } from './BanUserUseCase';
import { BindUserWithBlogUseCase } from './BindUserWithBlogUseCase';
import { PostsModule } from '../posts';
import { CommentsModule } from '../comments';
import { BanBlogUseCase } from './BanBlogUseCase';

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    AuthModule,
    BlogsModule,
    PostsModule,
    CommentsModule,
  ],
  exports: [],
  controllers: [SuperAdminController],
  providers: [BanUserUseCase, BindUserWithBlogUseCase, BanBlogUseCase],
})
export class SuperAdminModule {}
