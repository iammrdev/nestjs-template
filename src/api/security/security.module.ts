import { Module } from '@nestjs/common';

import { SecurityController } from './security.controller';
import { UsersModule } from '../users';
import { JwtRefreshModule } from '../../app/auth-jwt-refresh/jwt-refresh.module';
import { AuthModule } from '../auth';

@Module({
  imports: [JwtRefreshModule, UsersModule, AuthModule],
  exports: [],
  controllers: [SecurityController],
  providers: [],
})
export class SecurityModule {}
