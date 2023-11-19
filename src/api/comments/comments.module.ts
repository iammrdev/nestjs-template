import { Module } from '@nestjs/common';

import { CommentsController } from './controller/comments.controller';
import { CommentsService } from './service/comments.service';
import { CommentsRepository } from './repository/comments.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsModel, CommentsSchema } from './repository/comments.model';
import { UsersModule } from '../users';
import { JwtAccessModule } from '../../app/auth-jwt-access/jwt-access.module';
import { CommentsQueryRepository } from './repository/comments.query.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CommentsModel.name, schema: CommentsSchema },
    ]),
    JwtAccessModule,
    UsersModule,
  ],
  exports: [CommentsService, CommentsRepository, CommentsQueryRepository],
  controllers: [CommentsController],
  providers: [CommentsRepository, CommentsQueryRepository, CommentsService],
})
export class CommentsModule {}
