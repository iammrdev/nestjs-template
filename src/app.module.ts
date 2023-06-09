import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import { TestingModule } from './api/testing';
import { UsersModule } from './api/users';
import { BlogsModule } from './api/blogs';
import { PostsModule } from './api/posts';
import { CommentsModule } from './api/comments';
import { SecurityModule } from './api/security/security.module';
import { BloggerModule } from './api/blogger/blogger.module';
import { SuperAdminModule } from './api/sa/sa.module';
import { AuthModule } from './api/auth';
import { CqrsModule } from '@nestjs/cqrs';

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
    AuthModule,
    SecurityModule,
    UsersModule,
    BlogsModule,
    PostsModule,
    CommentsModule,
    BloggerModule,
    SuperAdminModule,
  ],
  controllers: [],
  exports: [],
  providers: [],
})
export class AppModule {}
