import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsModel, BlogsSchema } from './repository/blogs.model';
import { BlogsService } from './service/blogs.service';
import { BlogsController } from './controller/blogs.controller';
import { BlogsRepository } from './repository/blogs.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BlogsModel.name, schema: BlogsSchema }]),
  ],
  exports: [BlogsService],
  controllers: [BlogsController],
  providers: [BlogsRepository, BlogsService],
})
export class BlogsModule {}
