export interface AppToken {
  id: string;
  userId: string;
  ip: string;
  deviceId: string;
  title: string;
  refreshToken: string;
  iat: Date;
  exp: Date;
}
