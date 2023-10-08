import {
  Inject,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { Request, Response, NextFunction } from 'express';
import { MongooseModule } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { AuthService } from './service/auth.service';
import { UsersModule } from '../users';
import { JwtAccessModule } from '../../app/auth-jwt-access/jwt-access.module';
import { AuthController } from './controller/auth.controller';
import { JwtRefreshModule } from '../../app/auth-jwt-refresh/jwt-refresh.module';
import { BasicModule } from '../../app/auth-basic/basic.module';
import { RecoveryModel, RecoverySchema } from './repository/recovery.model';
import { TokensModel, TokensSchema } from './repository/tokens.model';
import { TokensRepository } from './repository/tokens.repository';
import { RecoveryRepository } from './repository/recovery.repository';
import { CreateUserUseCase } from '../users/use-case/create-user-use-case';
import { LoginUserUseCase } from './use-case/login-user-use-case';
import { RegisterUserUseCase } from './use-case/register-user-use-case.ts';
import { ResendRegistrationEmailUseCase } from './use-case/resened-registration-email-use-case';
import { GenerateNewPasswordUseCase } from './use-case/generate-new-password-use-case';
import { ConfirmRegistrationUseCase } from './use-case/confirm-registration-use-case';
import { RecoveryPasswordUseCase } from './use-case/recovery-password-use-case.ts';
import { GenerateNewTokensUseCase } from './use-case/generate-new-tokens-use-case';
import { LogoutUserUseCase } from './use-case/logout-user-use-case';

type Attempt = { ip: string; timestamp: number; url: string };

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: TokensModel.name, schema: TokensSchema },
    ]),
    MongooseModule.forFeature([
      { name: RecoveryModel.name, schema: RecoverySchema },
    ]),

    CacheModule.register(),
    UsersModule,
    JwtAccessModule,
    JwtRefreshModule,
    BasicModule,
  ],
  exports: [AuthService, TokensRepository],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokensRepository,
    RecoveryRepository,
    CreateUserUseCase,
    LoginUserUseCase,
    LogoutUserUseCase,
    RegisterUserUseCase,
    ResendRegistrationEmailUseCase,
    GenerateNewPasswordUseCase,
    ConfirmRegistrationUseCase,
    RecoveryPasswordUseCase,
    GenerateNewTokensUseCase,
  ],
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
    const attempts = (await this.cacheManager.get<Attempt[]>(key)) || [];

    const newAttempts = attempts
      .filter((item) => item.timestamp > now)
      .map((item) => ({ ...item, timestamp: now + 10000 }))
      .concat([{ ip: req.ip, timestamp: now + 10000, url }]);

    await this.cacheManager.set(key, newAttempts, 10000);

    // if (newAttempts.length > 5) {
    //   return res.sendStatus(HttpStatus.TOO_MANY_REQUESTS);
    // }

    next();
  }
}
