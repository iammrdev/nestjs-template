import { Injectable, NotFoundException } from '@nestjs/common';
import { AppUser } from '../../../types/users';
import { UsersRepository } from '../repository/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getUserById(id: string): Promise<AppUser | null> {
    return this.usersRepository.findById(id);
  }

  async getBannedUsersIds(): Promise<string[]> {
    return this.usersRepository.getBannedIds();
  }

  async deleteUser(id: string): Promise<void> {
    const existedUser = await this.getUserById(id);

    if (!existedUser) {
      throw new NotFoundException('User is not found');
    }

    await this.usersRepository.deleteById(id);
  }

  async deleteAll(): Promise<void> {
    await this.usersRepository.deleteAll();
  }
}
