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

  async validate(req, { id, login, email }: any): Promise<any> {
    if (!id) {
      throw new UnauthorizedException('forbidden');
    }
    return { id, login, email, refreshToken: req.cookies.refreshToken };
  }
}
