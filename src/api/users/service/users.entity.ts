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

  constructor(props: Props) {
    this.fillEntity(props);
  }

  public async setPassword(password: string): Promise<UsersEntity> {
    const salt = await genSalt(SALT_ROUNDS);
    this.passwordHash = await hash(password, salt);
    return this;
  }

  public async comparePassword(password: string): Promise<boolean> {
    return compare(password, this.passwordHash);
  }

  public fillEntity(props: Props) {
    this.login = props.login;
    this.email = props.email;
    this.createdAt = props.createdAt;
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
