import { genSalt, hash, compare } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { SALT_ROUNDS } from './users.service.constants';
import { User } from '../../../types/users';

type Confirmation = {
  status: boolean;
  code: string;
  expiration: Date;
  activation: Date | null;
};

type Props = {
  login: string;
  email: string;
  createdAt: Date;
  id?: string;
  confirmation?: Confirmation;
  passwordHash?: string;
};

export class UsersEntity {
  public login: string;
  public email: string;
  public createdAt: Date;

  public id?: string;
  public confirmation?: Confirmation;
  public passwordHash?: string;

  constructor(props: Props) {
    this.fillEntity(props);
  }

  public setId(id: string) {
    this.id = id;

    return this;
  }

  public async setPassword(password: string): Promise<UsersEntity> {
    const salt = await genSalt(SALT_ROUNDS);
    this.passwordHash = await hash(password, salt);

    return this;
  }

  public async comparePassword(password: string): Promise<boolean> {
    return compare(password, this.passwordHash);
  }

  public generateConfirmation() {
    this.confirmation = {
      status: false,
      code: uuidv4(),
      expiration: add(new Date(), { minutes: 60 }),
      activation: null,
    };

    return this;
  }

  public activate() {
    if (!this.confirmation) {
      throw new Error('No confirmation by user');
    }

    this.confirmation = {
      ...this.confirmation,
      status: true,
      activation: new Date(),
    };

    return this;
  }

  public fillEntity(props: Props) {
    this.id = props.id;
    this.login = props.login;
    this.email = props.email;
    this.createdAt = props.createdAt;
    this.confirmation = props.confirmation;
    this.passwordHash = props.passwordHash;
  }

  public toObject() {
    return {
      login: this.login,
      email: this.email,
      createdAt: this.createdAt,
      confirmation: this.confirmation,
      passwordHash: this.passwordHash,
    };
  }

  public toView(): User {
    if (!this.id || !this.confirmation) {
      throw new Error('Incorrect model data');
    }

    return {
      id: this.id,
      login: this.login,
      email: this.email,
      createdAt: this.createdAt,
      confirmation: this.confirmation,
    };
  }
}
