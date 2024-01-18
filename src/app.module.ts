import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import { TestingModule } from './api/testing';
import { UsersModule } from './api/users';
import { BlogsModule } from './api/blogs';
import { PostsModule } from './api/posts';
import { CommentsModule } from './api/comments';
import { SecurityModule } from './api/security/security.module';
import { BloggersModule } from './api/bloggers/bloggers.module';
import { SuperAdminModule } from './api/sa/sa.module';
import { AuthModule } from './api/auth';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

const getMongoDbConfig = (): MongooseModuleAsyncOptions => {
  return {
    useFactory: async () => ({
      uri: 'mongodb+srv://iashchuk:E6TPtwwx19WOunXV@cluster0.p4apqvz.mongodb.net/?retryWrites=true&w=majority',
    }),
  };
};

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync(getMongoDbConfig()),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        synchronize: false,
        entities: ['dist/**/postgresql/*.entity.js'],
        migrations: ['dist/migrations/*.js'],
        ssl: true,
      }),
    }),
    TestingModule,
    AuthModule,
    SecurityModule,
    UsersModule,
    BlogsModule,
    PostsModule,
    CommentsModule,
    BloggersModule,
    SuperAdminModule,
  ],
  controllers: [],
  exports: [],
  providers: [],
})
export class AppModule {}
