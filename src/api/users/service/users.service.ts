import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateUserDto,
  GetUsersQuery,
  GetUsersWithBanInfoQuery,
  VeirifyUserDto,
} from './users.service.interface';
import { UsersEntity } from './users.entity';
import { UsersRepository } from '../repository/users.repository';
import { User } from '../../../types/users';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    // #note: для того, чтобы выводить ошибку по полю "field"
    const [userByEmail, userByLogin] = await Promise.all([
      this.usersRepository.findByLoginOrEmail(dto.email),
      this.usersRepository.findByLoginOrEmail(dto.login),
    ]);

    if (userByEmail) {
      throw new BadRequestException({
        errorsMessages: [{ message: 'User existed', field: 'email' }],
      });
    }

    if (userByLogin) {
      throw new BadRequestException({
        errorsMessages: [{ message: 'User existed', field: 'login' }],
      });
    }

    const entity = await new UsersEntity({
      ...dto,
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
      createdAt: new Date(),
    })
      .generateConfirmation()
      .setPassword(dto.password.toString());

    const { id } = await this.usersRepository.create(entity);

    return entity.setId(id).toView();
  }

  async getUsers(query: GetUsersQuery) {
    const users = await this.usersRepository.findAll(query);

    return {
      ...users,
      items: users.items.map((item) => ({
        id: item.id,
        login: item.login,
        email: item.email,
        createdAt: item.createdAt,
      })),
    };
  }

  async getUsersWithBanInfo(query: GetUsersWithBanInfoQuery) {
    const users = await this.usersRepository.findAll(query);

    return {
      ...users,
      items: users.items.map((item) => ({
        id: item.id,
        login: item.login,
        email: item.email,
        createdAt: item.createdAt,
        banInfo: item.banInfo,
      })),
    };
  }

  async getUsersBanned() {
    return this.usersRepository.findAllBannedIds();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async getUserByConfirmationCode(code: string): Promise<User | null> {
    return this.usersRepository.findByConfirmationCode(code);
  }
  async deleteUserById(id: string): Promise<{ status: 'ok' }> {
    await this.usersRepository.deleteById(id);

    return { status: 'ok' };
  }

  async deleteAll(): Promise<void> {
    await this.usersRepository.deleteAll();
  }

  async verifyUser(dto: VeirifyUserDto) {
    const existedUser = await this.usersRepository.findByLoginOrEmail(
      dto.loginOrEmail,
    );

    if (!existedUser || existedUser.banInfo.isBanned) {
      throw new UnauthorizedException('Unauthorized');
    }

    const userEntity = new UsersEntity(existedUser);

    const passwordIsValid = await userEntity.comparePassword(dto.password);

    if (!passwordIsValid || !userEntity.id) {
      throw new UnauthorizedException('Unauthorized');
    }

    return {
      id: userEntity.id,
      login: userEntity.login,
      email: userEntity.email,
      createdAt: userEntity.createdAt,
    };
  }

  async activateUser(id: string): Promise<User | null> {
    const existedUser = await this.getUserById(id);

    if (!existedUser) {
      throw new BadRequestException('User does not exist');
    }

    const entity = new UsersEntity(existedUser).activate();

    return this.usersRepository.updateById(id, entity);
  }

  async updateConfirmation(id: string): Promise<User | null> {
    const existedUser = await this.getUserById(id);

    if (!existedUser) {
      throw new BadRequestException('User does not exist');
    }

    const entity = new UsersEntity(existedUser).generateConfirmation();

    return this.usersRepository.updateById(id, entity);
  }

  async updatePassword(id: string, newPassword: string): Promise<User | null> {
    const existedUser = await this.usersRepository.findById(id);

    if (!existedUser) {
      throw new BadRequestException('User does not exist');
    }

    const entity = await new UsersEntity(existedUser).setPassword(
      newPassword.toString(),
    );

    return this.usersRepository.updateById(id, entity);
  }
}
