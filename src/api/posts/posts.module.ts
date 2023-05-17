import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModel, PostsSchema } from './repository/posts.model';
import { PostsService } from './service/posts.service';
import { PostsController } from './controller/posts.controller';
import { PostsRepository } from './repository/posts.repository';
import { BlogsModule } from '../blogs/blogs.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PostsModel.name, schema: PostsSchema }]),
    forwardRef(() => BlogsModule),
    CommentsModule,
  ],
  exports: [PostsService],
  controllers: [PostsController],
  providers: [PostsRepository, PostsService],
})
export class PostsModule {}
