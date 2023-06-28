import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { JWTPayloadInfo } from '../../types/auth';

export interface AccessTokenUserInfo {
  id: string;
  login: string;
  email: string;
}

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt.access',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'secret',
    });
  }

  async validate({
    id,
    login,
    email,
  }: JWTPayloadInfo): Promise<AccessTokenUserInfo> {
    return { id, login, email };
  }
}
