import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PostsModule } from '../posts/posts.module';
import { BlogsModel, BlogsSchema } from '../blogs/repository/blogs.model';
import { BlogsService } from '../blogs';
import { BlogsRepository } from '../blogs/repository/blogs.repository';
import { BloggerController } from './controller/blogger.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BlogsModel.name, schema: BlogsSchema }]),
    forwardRef(() => PostsModule),
  ],
  exports: [BlogsService],
  controllers: [BloggerController],
  providers: [BlogsRepository, BlogsService],
})
export class BloggerModule {}
