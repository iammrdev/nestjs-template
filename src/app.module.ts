import { Injectable, Module, NestMiddleware } from '@nestjs/common';
import { MongooseModule, MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import { TestingModule } from './api/testing';
import { UsersModule } from './api/users';
import { BlogsModule } from './api/blogs';
import { PostsModule } from './api/posts';
import { CommentsModule } from './api/comments';
import { AuthModule } from './api/auth';
import { NextFunction } from 'express';

const getMongoDbConfig = (): MongooseModuleAsyncOptions => {
  return {
    useFactory: async () => ({
      uri: 'mongodb+srv://iashchuk:E6TPtwwx19WOunXV@cluster0.p4apqvz.mongodb.net/?retryWrites=true&w=majority',
    }),
  };
};
@Injectable()
export class SampleMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Sample middleware is running...');
    next();
  }
}

@Module({
  imports: [
    MongooseModule.forRootAsync(getMongoDbConfig()),
    // JwtAccessModule,
    TestingModule,
    AuthModule,
    UsersModule,
    BlogsModule,
    PostsModule,
    CommentsModule,
  ],
  controllers: [],
  exports: [],
  providers: [],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(AuthMiddleware).forRoutes('comments');
  // }
}
