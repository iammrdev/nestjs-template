import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RefreshTokenStrategy } from './jwt-refresh-token.strategy';

const moduleOptions = async (): Promise<JwtModuleOptions> => {
  return {
    secret: 'secret2',
    signOptions: {
      expiresIn: '20s',
      algorithm: 'HS256',
    },
  };
};

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: moduleOptions,
    }),
  ],
  exports: ['JwtRefreshService'],
  providers: [
    { provide: 'JwtRefreshService', useExisting: JwtService },
    RefreshTokenStrategy,
  ],
})
export class JwtRefreshModule {}
