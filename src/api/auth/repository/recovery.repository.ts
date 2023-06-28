import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DataRecovery, RecoveryModel } from './recovery.model';
import { RecoveryEntity } from '../service/auth.service.interface';

@Injectable()
export class RecoveryRepository {
  constructor(
    @InjectModel(RecoveryModel.name)
    private readonly recoveryModel: Model<RecoveryModel>,
  ) {}

  private buildRecovery(dbRecovery: DataRecovery) {
    return dbRecovery;
  }

  public async create(recoveryEntity: RecoveryEntity): Promise<DataRecovery> {
    const dbRecovery = await this.recoveryModel.create(recoveryEntity);

    return this.buildRecovery(dbRecovery);
  }

  public async findById(id: string): Promise<DataRecovery | null> {
    const dbRecovery = await this.recoveryModel.findOne({ _id: id }).exec();

    return dbRecovery && this.buildRecovery(dbRecovery);
  }

  public async findByCode(code: string): Promise<DataRecovery | null> {
    const dbRecovery = await this.recoveryModel.findOne({ code }).exec();

    return dbRecovery && this.buildRecovery(dbRecovery);
  }

  public async deleteAll(): Promise<number> {
    return (await this.recoveryModel.deleteMany()).deletedCount;
  }
}
