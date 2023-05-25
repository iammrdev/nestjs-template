import { Module } from '@nestjs/common';

import { CommentsController } from './controller/comments.controller';
import { CommentsService } from './service/comments.service';
import { CommentsRepository } from './repository/comments.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsModel, CommentsSchema } from './repository/comments.model';
import { UsersModule } from '../users';
import { JwtAccessModule } from '../auth/jwt/jwt-access.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CommentsModel.name, schema: CommentsSchema },
    ]),
    JwtAccessModule,
    UsersModule,
  ],
  exports: [CommentsService],
  controllers: [CommentsController],
  providers: [CommentsRepository, CommentsService],
})
export class CommentsModule {}
