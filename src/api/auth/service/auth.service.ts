import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { TokensRepository } from '../repository/tokens.repository';
import { RecoveryRepository } from '../repository/recovery.repository';
import { JWTPayload, JWTPayloadInfo } from '../../../types/auth';
import {
  CreateRecoveryDto,
  GenerateTokenDto,
  RecoveryEntity,
  RefreshTokenEntity,
} from './auth.service.interface';
import { Token } from '../../../types/tokens';

@Injectable()
export class AuthService {
  constructor(
    @Inject('JwtAccessService') private readonly jwtAccessService: JwtService,
    @Inject('JwtRefreshService') private readonly jwtRefreshService: JwtService,
    private readonly tokensRepository: TokensRepository,
    private readonly recoveryRepository: RecoveryRepository,
  ) {}

  private async getAccessTokenInfo(token: string) {
    return this.jwtAccessService.decode(token) as JWTPayloadInfo;
  }

  private async getRefreshTokenInfo(token: string) {
    return this.jwtRefreshService.decode(token) as JWTPayloadInfo;
  }

  async generateAuthInfo(dto: GenerateTokenDto) {
    const payload: JWTPayload = {
      id: dto.userId,
      login: dto.login,
      email: dto.email,
      deviceId: dto.deviceId || uuidv4(),
    };

    const accessToken = await this.jwtAccessService.signAsync(payload);
    const refreshToken = await this.jwtRefreshService.signAsync(payload);
    const refreshTokenInfo = await this.getRefreshTokenInfo(refreshToken);

    const refreshTokenEntity: RefreshTokenEntity = {
      userId: payload.id,
      deviceId: payload.deviceId,
      ip: dto.ip,
      title: dto.title,
      iat: new Date(refreshTokenInfo.iat * 1000),
      exp: new Date(refreshTokenInfo.exp * 1000),
      refreshToken,
    };

    await this.tokensRepository.create(refreshTokenEntity);

    return { accessToken, refreshToken };
  }

  async getUserSessionByToken(token: string): Promise<Token | null> {
    const tokenInfo = await this.getAccessTokenInfo(token);

    return this.tokensRepository.findByUserId(tokenInfo.id);
  }

  async getUserDevices(token: string): Promise<Token[]> {
    const tokenInfo = await this.getRefreshTokenInfo(token);

    return this.tokensRepository.findAllByUserId(tokenInfo.id);
  }

  async terminateDevices(token: string): Promise<void> {
    const tokenInfo = await this.getRefreshTokenInfo(token);

    await this.tokensRepository.deleteByUser(tokenInfo.id, tokenInfo.deviceId);
  }

  async terminateDevice(token: string, deviceId: string): Promise<void> {
    const tokenInfo = await this.getRefreshTokenInfo(token);

    const tokenByDeviceId = await this.tokensRepository.findByDeviceId(
      deviceId,
    );

    if (!tokenByDeviceId) {
      throw new NotFoundException('NotFoundE');
    }

    if (tokenInfo.id !== tokenByDeviceId?.userId) {
      throw new ForbiddenException('Forbidden');
    }

    await this.tokensRepository.deleteById(tokenByDeviceId.id);
  }

  async checkActiveSessions(token?: string): Promise<void> {
    if (!token) {
      return;
    }

    const [, accessToken] = token.split(' ');
    const userSession = await this.getUserSessionByToken(accessToken);

    if (userSession) {
      throw new BadRequestException('User has active session');
    }
  }

  async getRefreshToken(token: string): Promise<Token | null> {
    return this.tokensRepository.findByToken(token);
  }

  async deleteToken(token: string): Promise<void> {
    await this.tokensRepository.deleteById(token);
  }

  async createRecovery(dto: CreateRecoveryDto) {
    const recovery: RecoveryEntity = {
      userId: dto.userId,
      deviceId: uuidv4(),
      ip: dto.ip,
      title: dto.title,
      code: uuidv4(),
      iat: new Date(),
      exp: add(new Date(), { minutes: 60 }),
    };

    return this.recoveryRepository.create(recovery);
  }

  async getRecovery(code: string) {
    return this.recoveryRepository.findByCode(code);
  }

  async deleteAll() {
    return Promise.all([
      this.tokensRepository.deleteAll(),
      this.recoveryRepository.deleteAll(),
    ]);
  }
}
