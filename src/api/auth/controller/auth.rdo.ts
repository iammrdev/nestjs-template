import { Expose } from 'class-transformer';

export class AuthMeRdo {
  @Expose()
  public email: string;

  @Expose()
  public login: string;

  @Expose({ name: 'id' })
  public userId: number;
}
