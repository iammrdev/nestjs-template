export class CreateRecoveryDto {
  public userId: string;
  public ip: string;
  public title: string;
}

export class GenerateTokenDto {
  public userId: string;
  public login: string;
  public email: string;
  public ip: string;
  public title: string;
  public deviceId?: string;
}

export class RefreshTokenEntity {
  public userId: string;
  public ip: string;
  public title: string;
  public deviceId: string;
  public refreshToken: string;
  public iat: Date;
  public exp: Date;
}

export class RecoveryEntity {
  public userId: string;
  public ip: string;
  public title: string;
  public deviceId: string;
  public code: string;
  public iat: Date;
  public exp: Date;
}
