import { genSalt, hash, compare } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { SALT_ROUNDS } from './users.service.constants';
import { UsersModelData } from '../repository/user.model.types';

type Confirmation = {
  status: boolean;
  code: string;
  expiration: Date;
  activation: Date | null;
};

type BanInfo = {
  isBanned: boolean;
  banDate: Date | null;
  banReason: string | null;
};

type Props = {
  login: string;
  email: string;
  createdAt: Date;
  banInfo: BanInfo;
  id?: string;
  confirmation?: Confirmation;
  passwordHash?: string;
};

export type UserView = {
  id: string;
  login: string;
  email: string;
  banInfo: BanInfo;
  confirmation: Confirmation;
  createdAt: Date;
};

export class UsersEntity {
  public login: string;
  public email: string;
  public createdAt: Date;
  public banInfo: BanInfo;

  public id?: string;
  public confirmation?: Confirmation;
  public passwordHash?: string;

  constructor(props: Props) {
    this.fillEntity(props);
  }

  public setId(id: string): UsersEntity {
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

  public generateConfirmation(): UsersEntity {
    this.confirmation = {
      status: false,
      code: uuidv4(),
      expiration: add(new Date(), { minutes: 60 }),
      activation: null,
    };

    return this;
  }

  public activate(): UsersEntity {
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

  public handleBan(newBanInfo: Omit<BanInfo, 'banDate'>): UsersEntity {
    this.banInfo = {
      isBanned: newBanInfo.isBanned,
      banReason: newBanInfo.isBanned ? newBanInfo.banReason : null,
      banDate: newBanInfo.isBanned ? new Date() : null,
    };

    return this;
  }

  public fillEntity(props: Props): void {
    this.id = props.id;
    this.login = props.login;
    this.email = props.email;
    this.createdAt = props.createdAt;
    this.banInfo = props.banInfo;
    this.confirmation = props.confirmation;
    this.passwordHash = props.passwordHash;
  }

  public toModel(): Omit<UsersModelData, '_id'> {
    if (!this.passwordHash || !this.confirmation) {
      throw new Error('Incorrect model data');
    }

    return {
      login: this.login,
      email: this.email,
      createdAt: this.createdAt,
      confirmation: this.confirmation,
      passwordHash: this.passwordHash,
      banInfo: this.banInfo,
    };
  }

  public toView(): UserView {
    if (!this.id || !this.confirmation) {
      throw new Error('Incorrect view data');
    }

    return {
      id: this.id,
      login: this.login,
      email: this.email,
      createdAt: this.createdAt,
      confirmation: this.confirmation,
      banInfo: this.banInfo,
    };
  }
}

type CreateUserEntityParams = {
  login: string;
  password: string;
  email: string;
};

export const createUserEntity = async (
  params: CreateUserEntityParams,
): Promise<UsersEntity> =>
  new UsersEntity({
    ...params,
    banInfo: {
      isBanned: false,
      banDate: null,
      banReason: null,
    },
    createdAt: new Date(),
  })
    .generateConfirmation()
    .setPassword(params.password.toString());
