import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersModule } from '../users';
import { BlogsModule } from '../blogs';
import { AuthModule } from '../auth';
import { SuperAdminController } from './sa.controller';
import { PostsModule } from '../posts';
import { CommentsModule } from '../comments';
import { BanUserUseCase } from './use-case/BanUserUseCase';
import { BindUserWithBlogUseCase } from './use-case/BindUserWithBlogUseCase';
import { BanBlogUseCase } from './use-case/BanBlogUseCase';
import { CreateUserUseCase } from '../users/use-case/create-user-use-case';
import { BlogIdValidator } from './sa.controller.dto';

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
  providers: [
    CreateUserUseCase,
    BanUserUseCase,
    BindUserWithBlogUseCase,
    BanBlogUseCase,
    BlogIdValidator,
  ],
})
export class SuperAdminModule {}
