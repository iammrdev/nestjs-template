import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject('JwtAccessService') private readonly jwtAccessService: JwtService,
  ) {}
  async use(req: Request, _res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = this.jwtAccessService.verify(token);
        req['user'] = decoded;
      } catch {}
    }
    next();
  }
}
