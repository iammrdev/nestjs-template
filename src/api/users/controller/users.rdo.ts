import { Expose } from 'class-transformer';

export class GetUsersRdo {
  @Expose()
  public id: number;

  @Expose()
  public login: string;

  @Expose()
  public email: string;

  @Expose()
  public createdAt: string;
}
