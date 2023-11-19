import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthUser, JWTPayloadInfo } from '../../types/auth';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt.refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request): string | null => request?.cookies?.refreshToken || null,
      ]),
      ignoreExpiration: false,
      secretOrKey: 'secret2',
      passReqToCallback: true,
    });
  }

  async validate(req, { id, login, email }: JWTPayloadInfo): Promise<AuthUser> {
    if (!id) {
      throw new UnauthorizedException('forbidden');
    }
    return { id, login, email, refreshToken: req.cookies.refreshToken };
  }
}
