import { Expose } from 'class-transformer';

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

type User = {
  id: string;
  login: string;
  email: string;
  banInfo: BanInfo;
  confirmation: Confirmation;
  createdAt: Date;
};

export type PostNewPasswordRdo = User;

export type PostLoginRdo = { accessToken: string };

export type PostRefreshTokenRdo = { accessToken: string };

export class GetMeRdo {
  @Expose()
  public email: string;

  @Expose()
  public login: string;

  @Expose({ name: 'id' })
  public userId: number;
}
