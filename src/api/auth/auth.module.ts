import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './service/auth.service';
import { UsersModule } from '../users';
import { JwtAccessModule } from '../../app/auth-jwt-access/jwt-access.module';
import { AuthController } from './controller/auth.controller';
import { JwtRefreshModule } from '../../app/auth-jwt-refresh/jwt-refresh.module';
import { BasicModule } from '../../app/auth-basic/basic.module';
import {
  RecoveryModel,
  RecoverySchema,
} from './repository/mongodb/recovery.model';
import { TokensModel, TokensSchema } from './repository/mongodb/tokens.model';
import { TokensRepository, RecoveryRepository } from './repository';
import { CreateUserUseCase } from '../users/use-case/create-user-use-case';
import { LoginUserUseCase } from './use-case/login-user-use-case';
import { ResendRegistrationEmailUseCase } from './use-case/resend-registration-email-use-case';
import { GenerateNewPasswordUseCase } from './use-case/generate-new-password-use-case';
import { ConfirmRegistrationUseCase } from './use-case/confirm-registration-use-case';
import { RecoveryPasswordUseCase } from './use-case/recovery-password-use-case.ts';
import { GenerateNewTokensUseCase } from './use-case/generate-new-tokens-use-case';
import { LogoutUserUseCase } from './use-case/logout-user-use-case';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: TokensModel.name, schema: TokensSchema },
    ]),
    MongooseModule.forFeature([
      { name: RecoveryModel.name, schema: RecoverySchema },
    ]),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 5,
      },
    ]),
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
    ResendRegistrationEmailUseCase,
    GenerateNewPasswordUseCase,
    ConfirmRegistrationUseCase,
    RecoveryPasswordUseCase,
    GenerateNewTokensUseCase,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AuthModule {}
