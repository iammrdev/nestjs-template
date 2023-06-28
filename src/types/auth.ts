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
