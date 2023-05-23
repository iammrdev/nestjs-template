import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as PassportBasicStrategy } from 'passport-http';

@Injectable()
export class BasicStrategy extends PassportStrategy(PassportBasicStrategy) {
  constructor() {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    if (username !== 'admin' || password !== 'qwerty') {
      throw new UnauthorizedException('forbidden');
    }

    return { username };
  }
}

@Injectable()
export class BasicGuard extends AuthGuard('basic') {}
