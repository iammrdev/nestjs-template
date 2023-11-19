export type JWTPayload = {
  id: string;
  login: string;
  email: string;
  deviceId: string;
};

export type JWTPayloadInfo = JWTPayload & {
  iat: number;
  exp: number;
};

export interface AuthUser {
  id: string;
  login: string;
  email: string;
  refreshToken: string;
}
