import { Injectable } from '@nestjs/common';
import { Pagination } from '../../../../core/pagination';
import { AppUser } from '../../../../types/users';
import { UsersSQLModelData } from '../user.model.types';
import {
  FindAllUsersParams,
  FindAllUsersResponse,
  FindAllUsersWithBanInfoParams,
  FindAllUsersWithBanInfoResponse,
} from '../users.query.repository.types';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UsersQuerySQLRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private buildUser(dbUser: UsersSQLModelData): AppUser {
    return {
      id: dbUser.id,
      login: dbUser.login,
      email: dbUser.email,
      confirmation: {
        status: dbUser.confirmationStatus,
        code: dbUser.confirmationCode,
        expiration: dbUser.confirmationExpiration,
        activation: dbUser.confirmationActivation,
      },
      passwordHash: dbUser.passwordHash,
      banInfo: {
        isBanned: dbUser.banInfoIsBanned,
        banDate: dbUser.banInfoBanDate,
        banReason: dbUser.banInfoBanReason,
      },
      createdAt: dbUser.createdAt,
    };
  }

  private getPaginationFilter(
    params: FindAllUsersParams | FindAllUsersWithBanInfoParams,
  ): string {
    const filter: string[] = [];

    if ('banStatus' in params && params.banStatus !== 'all') {
      filter.push(`"banInfoIsBanned"=${params.banStatus === 'banned'}`);
    }

    if (params.searchLoginTerm && params.searchEmailTerm) {
      filter.push(
        `UPPER("login") like UPPER('%${params.searchLoginTerm}%') OR
         UPPER("email") like UPPER('%${params.searchEmailTerm}%')`,
      );
    } else if (params.searchEmailTerm) {
      filter.push(`UPPER("email") like UPPER('%${params.searchEmailTerm}%')`);
    } else if (params.searchLoginTerm) {
      filter.push(`UPPER("login") like UPPER('%${params.searchLoginTerm}%')`);
    }

    if (filter.length === 0) {
      return '';
    }

    return ` WHERE ${filter.join(' AND ')}`;
  }

  private async find(
    params: FindAllUsersParams | FindAllUsersWithBanInfoParams,
  ): Promise<Pagination<AppUser>> {
    const filter = this.getPaginationFilter(params);

    const [countData] = await this.dataSource
      .query(`SELECT COUNT (*) FROM "users"${filter}
    `);

    const pagination = new Pagination<AppUser>({
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount: Number(countData.count),
    });

    const dbUsers = await this.dataSource.query(
      `SELECT * FROM users${filter} ORDER BY "${params.sortBy}" ${params.sortDirection} LIMIT $1 OFFSET $2`,
      [pagination.pageSize, pagination.skip],
    );

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
