import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyObject, Model } from 'mongoose';
import { Pagination } from '../../../core/pagination';
import { AppUser } from '../../../types/users';
import { UsersModel } from './users.model';
import { UsersModelData } from './user.model.types';
import {
  FindAllUsersParams,
  FindAllUsersResponse,
  FindAllUsersWithBanInfoParams,
  FindAllUsersWithBanInfoResponse,
} from './users.query.repository.types';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(UsersModel.name)
    private readonly usersModel: Model<UsersModel>,
  ) {}

  private buildUser(dbUser: UsersModelData): AppUser {
    return {
      id: dbUser._id.toString(),
      login: dbUser.login,
      email: dbUser.email,
      confirmation: dbUser.confirmation,
      banInfo: dbUser.banInfo,
      passwordHash: dbUser.passwordHash,
      createdAt: dbUser.createdAt,
    };
  }

  private getPaginationFilter(
    params: FindAllUsersParams | FindAllUsersWithBanInfoParams,
  ): Record<string, any> {
    const filter = {};

    const $or: AnyObject[] = [];

    if (params.searchLoginTerm) {
      $or.push({ login: RegExp(params.searchLoginTerm, 'i') });
    }

    if (params.searchEmailTerm) {
      $or.push({ email: RegExp(params.searchEmailTerm, 'i') });
    }

    if ('banStatus' in params && params.banStatus !== 'all') {
      Object.assign(filter, {
        'banInfo.isBanned': params.banStatus === 'banned',
      });
    }

    if (params.searchLoginTerm || params.searchEmailTerm) {
      return Object.assign(filter, { $or });
    }

    return filter;
  }

  private async find(
    params: FindAllUsersParams | FindAllUsersWithBanInfoParams,
  ): Promise<Pagination<AppUser>> {
    const filter = this.getPaginationFilter(params);

    const totalCount = await this.usersModel.countDocuments(filter).exec();

    const pagination = new Pagination<AppUser>({
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });

    const dbUsers = await this.usersModel
      .find(filter)
      .sort({ [params.sortBy]: params.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .exec();

    return pagination.setItems(dbUsers.map(this.buildUser));
  }

  public async findAllUsers(
    params: FindAllUsersParams,
  ): Promise<FindAllUsersResponse> {
    const data = await this.find(params);

    return data.toView((item) => ({
      id: item.id,
      login: item.login,
      email: item.email,
      createdAt: item.createdAt,
    }));
  }

  public async findAllWithBanInfo(
    params: FindAllUsersWithBanInfoParams,
  ): Promise<FindAllUsersWithBanInfoResponse> {
    const data = await this.find(params);

    return data.toView((item) => ({
      id: item.id,
      login: item.login,
      email: item.email,
      createdAt: item.createdAt,
      banInfo: item.banInfo,
    }));
  }
}
