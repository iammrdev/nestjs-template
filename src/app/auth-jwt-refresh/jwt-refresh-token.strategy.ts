import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JWTPayloadInfo } from '../../types/auth';

export interface RefreshTokenUserInfo {
  id: string;
  login: string;
  email: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt.refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => request?.cookies?.refreshToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: 'secret2',
      passReqToCallback: true,
    });
  }

  async validate(
    req,
    { id, login, email }: JWTPayloadInfo,
  ): Promise<RefreshTokenUserInfo> {
    if (!id) {
      throw new UnauthorizedException('forbidden');
    }
    return { id, login, email, refreshToken: req.cookies.refreshToken };
  }
}
