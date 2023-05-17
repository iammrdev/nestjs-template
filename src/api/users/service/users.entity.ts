import { genSalt, hash, compare } from 'bcrypt';
import { SALT_ROUNDS } from './users.service.constants';

type Props = {
  login: string;
  email: string;
  createdAt?: Date;
};

export class UsersEntity {
  public login: string;
  public passwordHash: string;
  public email: string;
  public createdAt?: Date;

  constructor(user: Props) {
    this.fillEntity(user);
  }

  public async setPassword(password: string): Promise<UsersEntity> {
    const salt = await genSalt(SALT_ROUNDS);
    this.passwordHash = await hash(password, salt);
    return this;
  }

  public async comparePassword(password: string): Promise<boolean> {
    return compare(password, this.passwordHash);
  }

  public fillEntity(user: Props) {
    this.login = user.login;
    this.email = user.email;
  }

  public toObject() {
    return {
      login: this.login,
      email: this.email,
      passwordHash: this.passwordHash,
      createdAt: this.createdAt,
    };
  }
}
