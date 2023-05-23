import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { UsersModule } from '../users';
import { JwtAccessModule } from './jwt/jwt-access.module';
import { TokensModule } from './service/tokens.module';
import { AuthController } from './controller/auth.controller';
import { JwtRefreshModule } from './jwt/jwt-refresh.module';
import { RecoveryModule } from './service/recovery.module';
import { BasicModule } from './jwt/basic.module';

@Module({
  imports: [
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
export class AuthModule {}
