import { Injectable } from '@nestjs/common';
import { AppUser } from '../../../../types/users';
import { UsersModelData, UsersSQLModelData } from '../user.model.types';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UsersSQLRepository {
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

  public async create(userData: Omit<UsersModelData, '_id'>): Promise<AppUser> {
    const values = [
      userData.login,
      userData.email,
      userData.passwordHash,
      userData.confirmation.status,
      userData.confirmation.code,
      userData.confirmation.expiration,
      userData.confirmation.activation,
      userData.banInfo.isBanned,
      userData.banInfo.banDate,
      userData.banInfo.banReason,
      userData.createdAt,
    ];

    const [dbUser] = await this.dataSource.query(
      `
    INSERT INTO users (
      "login",
      "email",
      "passwordHash",
      "confirmationStatus",
      "confirmationCode",
      "confirmationExpiration",
      "confirmationActivation",
      "banInfoIsBanned",
      "banInfoBanDate",
      "banInfoBanReason",
      "createdAt"
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
  `,
      values,
    );

    return this.buildUser(dbUser);
  }

  public async findById(id: string): Promise<AppUser | null> {
    const [dbUser] = await this.dataSource.query<UsersSQLModelData[]>(
      `SELECT * FROM users WHERE id=$1 LIMIT 1`,
      [id],
    );

    return dbUser ? this.buildUser(dbUser) : null;
  }

  public async findByEmail(email: string): Promise<AppUser | null> {
    const [dbUser] = await this.dataSource.query<UsersSQLModelData[]>(
      `SELECT * FROM users WHERE email=$1 LIMIT 1`,
      [email],
    );

    return dbUser ? this.buildUser(dbUser) : null;
  }

  public async findByLoginOrEmail(
    loginOrEmail: string | { login: string; email: string },
  ): Promise<AppUser | null> {
    const login =
      typeof loginOrEmail === 'string' ? loginOrEmail : loginOrEmail.login;
    const email =
      typeof loginOrEmail === 'string' ? loginOrEmail : loginOrEmail.email;

    // const dbUser = await this.usersModel.findOne({
    //   $or: [{ login: RegExp(login, 'i') }, { email: RegExp(email, 'i') }],
    // });

    const [dbUser] = await this.dataSource.query<UsersSQLModelData[]>(
      `SELECT * FROM users WHERE email=$1 OR login=$2 LIMIT 1`,
      [email, login],
    );

    return dbUser ? this.buildUser(dbUser) : null;
  }

  public async findByConfirmationCode(code: string): Promise<AppUser | null> {
    const [dbUser] = await this.dataSource.query<UsersSQLModelData[]>(
      `SELECT * FROM users WHERE "confirmationCode"=$1 LIMIT 1`,
      [code],
    );

    return dbUser ? this.buildUser(dbUser) : null;
  }

  public async getBannedIds(): Promise<string[]> {
    const dbUsers = await this.dataSource.query<UsersSQLModelData[]>(
      `SELECT * FROM users WHERE "banInfoIsBanned"=$1`,
      [true],
    );

    return dbUsers.map((item) => item.id);
  }

  public async updateById(
    id: string,
    userData: Omit<UsersModelData, '_id'>,
  ): Promise<AppUser | null> {
    const values = [
      userData.login,
      userData.email,
      userData.passwordHash,
      userData.confirmation.status,
      userData.confirmation.code,
      userData.confirmation.expiration,
      userData.confirmation.activation,
      userData.banInfo.isBanned,
      userData.banInfo.banDate,
      userData.banInfo.banReason,
      userData.createdAt,
      id,
    ];

    const [[dbUser]] = await this.dataSource.query(
      `
        UPDATE users
        SET
        "login"=$1,
        "email"=$2,
        "passwordHash"=$3,
        "confirmationStatus"=$4,
        "confirmationCode"=$5,
        "confirmationExpiration"=$6,
        "confirmationActivation"=$7,
        "banInfoIsBanned"=$8,
        "banInfoBanDate"=$9,
        "banInfoBanReason"=$10,
        "createdAt"=$11
        WHERE "id"=$12
        RETURNING *;
    `,
      values,
    );

    return dbUser && this.buildUser(dbUser);
  }

  public async deleteById(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM users WHERE id=$1`, [id]);
  }

  public async deleteAll(): Promise<void> {
    await this.dataSource.query(`DELETE FROM users`);
  }
}
