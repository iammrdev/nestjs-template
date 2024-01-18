import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecoveryModel } from './recovery.model';
import { RecoveryModelData } from '../recovery.model.types';

@Injectable()
export class RecoveryMongoDBRepository {
  constructor(
    @InjectModel(RecoveryModel.name)
    private readonly recoveryModel: Model<RecoveryModel>,
  ) {}

  public async create(
    recoveryModelData: Omit<RecoveryModelData, '_id'>,
  ): Promise<RecoveryModelData> {
    return this.recoveryModel.create(recoveryModelData);
  }

  public async findByCode(code: string): Promise<RecoveryModelData | null> {
    return this.recoveryModel.findOne({ code }).exec();
  }

  public async deleteAll(): Promise<number> {
    return (await this.recoveryModel.deleteMany()).deletedCount;
  }
}
