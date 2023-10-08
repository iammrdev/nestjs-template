import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppUser } from '../../../types/users';
import { UsersModel } from './users.model';
import { UserModelData } from './user.model.types';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(UsersModel.name)
    private readonly usersModel: Model<UsersModel>,
  ) {}

  private buildUser(dbUser: UserModelData) {
    return {
      id: dbUser._id.toString(),
      login: dbUser.login,
      email: dbUser.email,
      passwordHash: dbUser.passwordHash,
      confirmation: dbUser.confirmation,
      banInfo: dbUser.banInfo,
      createdAt: dbUser.createdAt,
    };
  }

  public async create(userData: Omit<UserModelData, '_id'>): Promise<AppUser> {
    const dbUser = await this.usersModel.create(userData);

    return this.buildUser(dbUser);
  }

  public async findById(id: string): Promise<AppUser | null> {
    const dbUser = await this.usersModel.findOne({ _id: id }).exec();

    return dbUser && this.buildUser(dbUser);
  }

  public async findByEmail(email: string): Promise<AppUser | null> {
    const dbUser = await this.usersModel.findOne({ email }).exec();

    return dbUser && this.buildUser(dbUser);
  }

  public async findByLoginOrEmail(
    loginOrEmail: string | { login: string; email: string },
  ) {
    const login =
      typeof loginOrEmail === 'string' ? loginOrEmail : loginOrEmail.login;
    const email =
      typeof loginOrEmail === 'string' ? loginOrEmail : loginOrEmail.email;

    const dbUser = await this.usersModel.findOne({
      $or: [{ login: RegExp(login, 'i') }, { email: RegExp(email, 'i') }],
    });

    return dbUser && this.buildUser(dbUser);
  }

  public async findByConfirmationCode(code: string): Promise<AppUser | null> {
    const dbUser = await this.usersModel
      .findOne({ 'confirmation.code': code })
      .exec();

    return dbUser && this.buildUser(dbUser);
  }

  public async findAllBannedIds(): Promise<string[]> {
    const dbUsers = await this.usersModel
      .find({ 'banInfo.isBanned': true })
      .exec();

    return dbUsers.map((item) => item._id.toString());
  }

  public async updateById(
    id: string,
    userData: Omit<UserModelData, '_id'>,
  ): Promise<AppUser | null> {
    const dbUser = await this.usersModel
      .findByIdAndUpdate(id, userData, { new: true })
      .exec();

    return dbUser && this.buildUser(dbUser);
  }

  public async deleteById(id: string): Promise<number> {
    return (await this.usersModel.deleteOne({ _id: id })).deletedCount;
  }

  public async deleteAll(): Promise<number> {
    return (await this.usersModel.deleteMany()).deletedCount;
  }
}
