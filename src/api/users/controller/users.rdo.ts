import { Expose } from 'class-transformer';
import { PaginationList } from '../../../types/common';

type User = {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
};

export class PostRdo {
  @Expose()
  public id: string;

  @Expose()
  public login: string;

  @Expose()
  public email: string;

  @Expose()
  public createdAt: string;
}

export type GetRdo = PaginationList<User[]>;
