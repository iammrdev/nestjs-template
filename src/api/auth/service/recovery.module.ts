import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecoveryModel, RecoverySchema } from './recovery.model';
import { RecoveryRepository } from './recovery.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RecoveryModel.name, schema: RecoverySchema },
    ]),
  ],
  providers: [RecoveryRepository],
  exports: [RecoveryRepository],
})
export class RecoveryModule {}
