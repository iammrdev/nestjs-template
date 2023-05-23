import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokensModel, TokensSchema } from './tokens.model';
import { TokensRepository } from './tokens.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TokensModel.name, schema: TokensSchema },
    ]),
  ],
  providers: [TokensRepository],
  exports: [TokensRepository],
})
export class TokensModule {}
