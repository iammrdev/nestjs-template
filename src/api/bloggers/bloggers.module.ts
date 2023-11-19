import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { PostsModule } from '../posts/posts.module';
import { BlogsModel, BlogsSchema } from '../blogs/repository/blogs.model';
import { BlogsService } from '../blogs';
import { BlogsRepository } from '../blogs/repository/blogs.repository';
import { BloggerController } from './controller/bloggers.controller';
import { BanBlogUserUseCase } from './use-case/BanBlogUserUseCase';
import { BloggersRepository } from './repository/bloggers.repository';
import { BloggersModel, BloggersSchema } from './repository/bloggers.model';
import { UsersModule } from '../users';
import { GetAllCommentsByUserUseCase } from './use-case/GetAllCommentsByUserUseCase';
import { CommentsModule } from '../comments';
import { GetUsersByBlogUseCase } from './use-case/GetUsersByBlogUseCase';
import { BlogsQueryRepository } from '../blogs/repository/blogs.query.repository';
import { BloggersQueryRepository } from './repository/bloggers.query.repository';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: BlogsModel.name, schema: BlogsSchema }]),
    MongooseModule.forFeature([
      { name: BloggersModel.name, schema: BloggersSchema },
    ]),
    forwardRef(() => PostsModule),
    UsersModule,
    CommentsModule,
  ],
  exports: [BlogsService],
  controllers: [BloggerController],
  providers: [
    BlogsRepository,
    BlogsQueryRepository,
    BloggersQueryRepository,
    BloggersRepository,
    BlogsService,
    BanBlogUserUseCase,
    GetAllCommentsByUserUseCase,
    GetUsersByBlogUseCase,
  ],
})
export class BloggersModule {}
