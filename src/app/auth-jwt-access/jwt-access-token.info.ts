import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAccessTokenInfo extends AuthGuard('jwt.access') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
  handleRequest(_error, user) {
    // if (error || !user) {
    //     throw error || new UnauthorizedException();
    //   }

    return user;
  }
}
