import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModel, PostsSchema } from './repository/posts.model';
import { PostsService } from './service/posts.service';
import { PostsController } from './controller/posts.controller';
import { PostsRepository } from './repository/posts.repository';
import { BlogsModule } from '../blogs/blogs.module';
import { CommentsModule } from '../comments/comments.module';
import { UsersModule } from '../users';
import { BlogIdValidator } from './controller/posts.controller.dto';
import { PostsQueryRepository } from './repository/posts.query.repository';
import { BloggersService } from '../bloggers/service/bloggers.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PostsModel.name, schema: PostsSchema }]),
    forwardRef(() => BlogsModule),
    CommentsModule,
    UsersModule,
  ],
  exports: [PostsService, PostsRepository, PostsQueryRepository],
  controllers: [PostsController],
  providers: [
    PostsRepository,
    PostsQueryRepository,
    PostsService,
    BloggersService,
    BlogIdValidator,
  ],
})
export class PostsModule {}
