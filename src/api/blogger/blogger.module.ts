import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { PostsModule } from '../posts/posts.module';
import { BlogsModel, BlogsSchema } from '../blogs/repository/blogs.model';
import { BlogsService } from '../blogs';
import { BlogsRepository } from '../blogs/repository/blogs.repository';
import { BloggerController } from './controller/blogger.controller';
import { BanBlogUserUseCase } from './BanBlogUserUseCase';
import { BlogUsersRepository } from '../blogs/repository/blog-users.repository';
import {
  BlogUsersModel,
  BlogUsersSchema,
} from '../blogs/repository/blog-users.model';
import { UsersModule } from '../users';
import { GetAllCommentsByUserUseCase } from './GetAllCommentsByUserUseCase';
import { CommentsModule } from '../comments';
import { GetUsersByBlogUseCase } from './GetUsersByBlogUseCase';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: BlogsModel.name, schema: BlogsSchema }]),
    MongooseModule.forFeature([
      { name: BlogUsersModel.name, schema: BlogUsersSchema },
    ]),
    forwardRef(() => PostsModule),
    UsersModule,
    CommentsModule,
  ],
  exports: [BlogsService],
  controllers: [BloggerController],
  providers: [
    BlogsRepository,
    BlogUsersRepository,
    BlogsService,
    BanBlogUserUseCase,
    GetAllCommentsByUserUseCase,
    GetUsersByBlogUseCase,
  ],
})
export class BloggerModule {}
