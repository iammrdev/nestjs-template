export interface TokensModelData {
  id?;
  _id?;
  userId: string;
  ip: string;
  deviceId: string;
  title: string;
  refreshToken: string;
  iat: Date;
  exp: Date;
}
