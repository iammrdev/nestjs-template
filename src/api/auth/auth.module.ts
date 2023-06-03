import {
  HttpStatus,
  Inject,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AuthService } from './service/auth.service';
import { UsersModule } from '../users';
import { JwtAccessModule } from './jwt/jwt-access.module';
import { TokensModule } from './service/tokens.module';
import { AuthController } from './controller/auth.controller';
import { JwtRefreshModule } from './jwt/jwt-refresh.module';
import { RecoveryModule } from './service/recovery.module';
import { BasicModule } from './jwt/basic.module';
import { Request, Response, NextFunction } from 'express';

@Module({
  imports: [
    CacheModule.register(),
    TokensModule,
    RecoveryModule,
    UsersModule,
    JwtAccessModule,
    JwtRefreshModule,
    BasicModule,
  ],
  exports: [AuthService],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(this.verifyIP.bind(this)).forRoutes(
      { path: 'auth/login', method: RequestMethod.POST },
      { path: 'auth/registration-confirmation', method: RequestMethod.POST },
      { path: 'auth/registration', method: RequestMethod.POST },
      {
        path: 'auth/registration-email-resending',
        method: RequestMethod.POST,
      },
      { path: 'auth/password-recovery', method: RequestMethod.POST },
      { path: 'auth/new-password', method: RequestMethod.POST },
    );
  }

  async verifyIP(req: Request, res: Response, next: NextFunction) {
    const url = req.originalUrl;
    const now = Date.now();

    const key = `${req.ip}-${url}`;
    const attempts = (await this.cacheManager.get(key)) as any;

    console.log({ key, attempts });

    const newAttempts = (attempts || [])
      .filter((item) => item.timestamp > now)
      .map((item) => ({ ...item, timestamp: now + 10000 }))
      .concat([{ ip: req.ip, timestamp: now + 10000, url }]);

    console.log({ newAttempts });

    await this.cacheManager.set(key, newAttempts, 10000);

    if (newAttempts.length > 5) {
      return res.sendStatus(HttpStatus.TOO_MANY_REQUESTS);
    }

    next();
  }
}
