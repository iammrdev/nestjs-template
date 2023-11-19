import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAccessTokenInfo extends AuthGuard('jwt.access') {
  canActivate(
    context: ExecutionContext,
  ): ReturnType<CanActivate['canActivate']> {
    return super.canActivate(context);
  }
  handleRequest<User>(_error, user: User): User {
    // if (error || !user) {
    //     throw error || new UnauthorizedException();
    //   }

    return user;
  }
}
