import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import { BlogsModule } from './api/blogs/blogs.module';

const getMongoDbConfig = (): MongooseModuleAsyncOptions => {
  return {
    useFactory: async () => ({
      uri: 'mongodb+srv://iashchuk:E6TPtwwx19WOunXV@cluster0.p4apqvz.mongodb.net/?retryWrites=true&w=majority',
    }),
  };
};

@Module({
  imports: [MongooseModule.forRootAsync(getMongoDbConfig()), BlogsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
