import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsModel, BlogsSchema } from './repository/blogs.model';
import { BlogsService } from './service/blogs.service';
import { BlogsController } from './controller/blogs.controller';
import { BlogsRepository } from './repository/blogs.repository';
import { PostsModule } from '../posts/posts.module';
import {
  BloggersModel,
  BloggersSchema,
} from '../bloggers/repository/bloggers.model';
import { BloggersRepository } from '../bloggers/repository/bloggers.repository';
import { BlogsQueryRepository } from './repository/blogs.query.repository';
import { BloggersQueryRepository } from '../bloggers/repository/bloggers.query.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BlogsModel.name, schema: BlogsSchema }]),
    MongooseModule.forFeature([
      { name: BloggersModel.name, schema: BloggersSchema },
    ]),
    forwardRef(() => PostsModule),
  ],
  exports: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    BloggersQueryRepository,
    BloggersRepository,
  ],
  controllers: [BlogsController],
  providers: [
    BlogsRepository,
    BlogsQueryRepository,
    BloggersRepository,
    BloggersQueryRepository,
    BlogsService,
  ],
})
export class BlogsModule {}
