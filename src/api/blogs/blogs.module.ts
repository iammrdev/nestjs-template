import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsModel, BlogsSchema } from './repository/blogs.model';
import { BlogsService } from './service/blogs.service';
import { BlogsController } from './controller/blogs.controller';
import { BlogsRepository } from './repository/blogs.repository';
import { PostsModule } from '../posts/posts.module';
import { BlogUsersModel, BlogUsersSchema } from './repository/blog-users.model';
import { BlogUsersRepository } from './repository/blog-users.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BlogsModel.name, schema: BlogsSchema }]),
    MongooseModule.forFeature([
      { name: BlogUsersModel.name, schema: BlogUsersSchema },
    ]),
    forwardRef(() => PostsModule),
  ],
  exports: [BlogsService, BlogsRepository, BlogUsersRepository],
  controllers: [BlogsController],
  providers: [BlogsRepository, BlogUsersRepository, BlogsService],
})
export class BlogsModule {}
