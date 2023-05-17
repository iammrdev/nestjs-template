import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import { TestingModule } from './api/testing';
import { UsersModule } from './api/users';
import { BlogsModule } from './api/blogs';
import { PostsModule } from './api/posts';
import { CommentsModule } from './api/comments';

const getMongoDbConfig = (): MongooseModuleAsyncOptions => {
  return {
    useFactory: async () => ({
      uri: 'mongodb+srv://iashchuk:E6TPtwwx19WOunXV@cluster0.p4apqvz.mongodb.net/?retryWrites=true&w=majority',
    }),
  };
};

@Module({
  imports: [
    MongooseModule.forRootAsync(getMongoDbConfig()),
    TestingModule,
    UsersModule,
    BlogsModule,
    PostsModule,
    CommentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
