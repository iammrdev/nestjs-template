import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

import { TokensRepository, RecoveryRepository } from '../repository';
import { JWTPayload, JWTPayloadInfo } from '../../../types/auth';
import { GenerateTokensParams } from './auth.service.types';
import { AppToken } from '../../../types/tokens';

@Injectable()
export class AuthService {
  constructor(
    @Inject('JwtAccessService') private readonly jwtAccessService: JwtService,
    @Inject('JwtRefreshService') private readonly jwtRefreshService: JwtService,
    private readonly tokensRepository: TokensRepository,
    private readonly recoveryRepository: RecoveryRepository,
  ) {}

  private async getRefreshTokenInfo(token: string): Promise<JWTPayloadInfo> {
    return this.jwtRefreshService.decode(token) as JWTPayloadInfo;
  }

  async generateTokens(
    params: GenerateTokensParams,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JWTPayload = {
      id: params.userId,
      login: params.login,
      email: params.email,
      deviceId: params.deviceId || uuidv4(),
    };

    const accessToken = await this.jwtAccessService.signAsync(payload);
    const refreshToken = await this.jwtRefreshService.signAsync(payload);
    const refreshTokenInfo = await this.getRefreshTokenInfo(refreshToken);

    const refreshTokenEntity = {
      userId: payload.id,
      deviceId: payload.deviceId,
      ip: params.ip,
      title: params.title,
      iat: new Date(refreshTokenInfo.iat * 1000),
      exp: new Date(refreshTokenInfo.exp * 1000),
      refreshToken,
    };

    await this.tokensRepository.create(refreshTokenEntity);

    return { accessToken, refreshToken };
  }

  async getUserDevices(token: string): Promise<AppToken[]> {
    const tokenInfo = await this.getRefreshTokenInfo(token);

    return this.tokensRepository.findAllByUserId(tokenInfo.id);
  }

  async terminateDevice(token: string, deviceId: string): Promise<void> {
    const tokenInfo = await this.getRefreshTokenInfo(token);

    const tokenByDeviceId = await this.tokensRepository.findByDeviceId(
      deviceId,
    );

    if (!tokenByDeviceId) {
      throw new NotFoundException('Token not found');
    }

    if (tokenInfo.id !== tokenByDeviceId?.userId) {
      throw new ForbiddenException('Forbidden');
    }

    await this.tokensRepository.deleteById(tokenByDeviceId.id);
  }

  async terminateDevices(token: string): Promise<void> {
    const tokenInfo = await this.getRefreshTokenInfo(token);

    await this.tokensRepository.deleteByUser(tokenInfo.id, tokenInfo.deviceId);
  }

  async deleteAll(): Promise<void> {
    await Promise.all([
      this.tokensRepository.deleteAll(),
      this.recoveryRepository.deleteAll(),
    ]);
  }
}
