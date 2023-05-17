import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, GetUsersQuery } from './users.service.interface';
import { UsersEntity } from './users.entity';
import { UsersRepository } from '../repository/users.repository';
import { User } from '../../../types/users';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(dto: CreateUserDto): Promise<User | null> {
    const existedUser = await this.usersRepository.findByEmail(dto.email);

    if (existedUser) {
      throw new BadRequestException('User existed');
    }

    const entity = await new UsersEntity({
      ...dto,
      createdAt: new Date(),
    }).setPassword(dto.password.toString());

    return this.usersRepository.create(entity);
  }

  async getUsers(query: GetUsersQuery) {
    return this.usersRepository.findAll(query);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async deleteUserById(id: string): Promise<{ status: 'ok' }> {
    await this.usersRepository.deleteById(id);

    return { status: 'ok' };
  }

  async deleteAll(): Promise<void> {
    await this.usersRepository.deleteAll();
  }
}
