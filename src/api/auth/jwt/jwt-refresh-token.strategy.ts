import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

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

  async validate(req, { sub, email }: any): Promise<any> {
    if (!sub) {
      throw new UnauthorizedException('forbidden');
    }
    return { sub, email, refreshToken: req.cookies.refreshToken };
  }
}
