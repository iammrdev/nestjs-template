import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecoveryModel } from './recovery.model';

@Injectable()
export class RecoveryRepository {
  constructor(
    @InjectModel(RecoveryModel.name)
    private readonly recoveryModel: Model<RecoveryModel>,
  ) {}

  private buildRecovery(dbRecovery: any) {
    return dbRecovery;
  }

  public async create(recoveryEntity: any): Promise<any> {
    const dbRecovery = await this.recoveryModel.create(recoveryEntity);

    return this.buildRecovery(dbRecovery);
  }

  public async findById(id: string): Promise<any | null> {
    const dbRecovery = await this.recoveryModel.findOne({ _id: id }).exec();

    return dbRecovery && this.buildRecovery(dbRecovery);
  }

  public async findByCode(code: string): Promise<any | null> {
    const dbRecovery = await this.recoveryModel.findOne({ code }).exec();

    return dbRecovery && this.buildRecovery(dbRecovery);
  }

  public async deleteAll(): Promise<number> {
    return (await this.recoveryModel.deleteMany()).deletedCount;
  }
}
