import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsModel, BlogsSchema } from './repository/blogs.model';
import { BlogsService } from './service/blogs.service';
import { BlogsController } from './controller/blogs.controller';
import { BlogsRepository } from './repository/blogs.repository';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BlogsModel.name, schema: BlogsSchema }]),
    forwardRef(() => PostsModule),
  ],
  exports: [BlogsService],
  controllers: [BlogsController],
  providers: [BlogsRepository, BlogsService],
})
export class BlogsModule {}
