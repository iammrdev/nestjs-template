import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CRUDRepository } from '../../../interfaces/crud-repository.interface';
import { UsersEntity } from '../service/users.entity';
import { User } from '../../../types/users';
import { DataUser, UsersModel } from './users.model';
import { GetUsersParams } from './user.repository.interfece';
import { PaginationList } from '../../../types/common';
import { Pagination } from '../../../core/pagination';

@Injectable()
export class UsersRepository
  implements CRUDRepository<UsersEntity, string, User>
{
  constructor(
    @InjectModel(UsersModel.name)
    private readonly usersModel: Model<UsersModel>,
  ) {}

  private buildUser(dbUser: DataUser) {
    return {
      id: dbUser._id.toString(),
      login: dbUser.login,
      email: dbUser.email,
      passwordHash: dbUser.passwordHash,
      confirmation: dbUser.confirmation,
      createdAt: dbUser.createdAt,
    };
  }

  private getPaginationFilter(params: GetUsersParams) {
    if (!params.searchLoginTerm && !params.searchEmailTerm) {
      return {};
    }

    const $or: { [key: string]: RegExp }[] = [];

    if (params.searchLoginTerm) {
      $or.push({ login: RegExp(params.searchLoginTerm, 'i') });
    }

    if (params.searchEmailTerm) {
      $or.push({ email: RegExp(params.searchEmailTerm, 'i') });
    }

    return { $or };
  }

  public async create(usersEntity: UsersEntity): Promise<User> {
    const dbUser = await this.usersModel.create(usersEntity);

    return this.buildUser(dbUser);
  }

  public async findAll(
    params: GetUsersParams,
  ): Promise<PaginationList<User[]>> {
    const filter = this.getPaginationFilter(params);
    const totalCount = await this.usersModel.countDocuments(filter).exec();

    const pagination = new Pagination<User>({
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

    return pagination.setItems(dbUsers.map(this.buildUser)).toView();
  }

  public async findById(id: string): Promise<User | null> {
    const dbUser = await this.usersModel.findOne({ _id: id }).exec();

    return dbUser && this.buildUser(dbUser);
  }

  public async findByEmail(email: string): Promise<User | null> {
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

  public async findByConfirmationCode(code: string): Promise<User | null> {
    const dbUser = await this.usersModel
      .findOne({ 'confirmation.code': code })
      .exec();

    return dbUser && this.buildUser(dbUser);
  }

  public async updateById(
    id: string,
    usersEntity: UsersEntity,
  ): Promise<User | null> {
    const dbUser = await this.usersModel
      .findByIdAndUpdate(id, usersEntity.toObject(), { new: true })
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
