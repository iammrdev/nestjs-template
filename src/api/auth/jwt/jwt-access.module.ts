import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from './jwt-access-token.strategy';

const moduleOptions = async (): Promise<JwtModuleOptions> => {
  return {
    secret: 'secret',
    signOptions: {
      expiresIn: '10s',
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
  exports: ['JwtAccessService'],
  providers: [
    { provide: 'JwtAccessService', useExisting: JwtService },
    AccessTokenStrategy,
  ],
})
export class JwtAccessModule {}
