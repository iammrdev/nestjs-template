import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokensRepository } from './tokens.repository';
import { RecoveryRepository } from './recovery.repository';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @Inject('JwtAccessService') private readonly jwtAccessService: JwtService,
    @Inject('JwtRefreshService') private readonly jwtRefreshService: JwtService,
    private readonly tokensRepository: TokensRepository,
    private readonly recoveryRepository: RecoveryRepository,
  ) {}

  private async getAccessTokenInfo(token: string) {
    return this.jwtAccessService.decode(token) as any;
  }

  private async getRefreshTokenInfo(token: string) {
    return this.jwtRefreshService.decode(token) as any;
  }

  async generateAuthInfo(dto: any, deviceId?: string) {
    // console.log({ dto });
    const payload = {
      id: dto.id,
      login: dto.login,
      email: dto.email,
      deviceId: deviceId || uuidv4(),
    };

    const accessToken = await this.jwtAccessService.signAsync(payload);
    const refreshToken = await this.jwtRefreshService.signAsync(payload);

    const refreshTokenInfo = await this.getRefreshTokenInfo(refreshToken);
    // const refreshTokenEntity = new TokensEntity({
    //   userId: dto.id,
    //   exp: new Date(refreshTokenInfo.exp * 1000),
    // });

    console.log({ refreshTokenInfo });

    const refreshTokenData = {
      userId: payload.id,
      deviceId: payload.deviceId,
      ip: '1', //req.socket.remoteAddress,
      title: '2', //req.headers['user-agent'],
      iat: new Date(refreshTokenInfo.iat * 1000),
      exp: new Date(refreshTokenInfo.exp * 1000),
      refreshToken,
    };

    console.log({ refreshTokenData });

    // await refreshTokenEntity.setToken(refreshToken);

    await this.tokensRepository.create(refreshTokenData);

    return {
      accessToken,
      refreshToken,
    };
  }

  async getUserSessionByToken(token: string): Promise<any> {
    const tokenInfo = await this.getAccessTokenInfo(token);

    return this.tokensRepository.findByUserId(tokenInfo.id);
  }

  async getUserDevices(token: string): Promise<any> {
    const tokenInfo = await this.getRefreshTokenInfo(token);

    const tokens = await this.tokensRepository.findAllByUserId(tokenInfo.id);

    return tokens.map((item) => ({
      ip: item.ip,
      title: item.title,
      deviceId: item.deviceId,
      lastActiveDate: item.iat,
    }));
  }

  async terminateDevices(token: string): Promise<any> {
    const tokenInfo = await this.getRefreshTokenInfo(token);

    await this.tokensRepository.deleteByUser(tokenInfo.id, tokenInfo.deviceId);
  }

  async terminateDevice(token: string, deviceId: string): Promise<any> {
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

  async getRefreshToken(token: string): Promise<any> {
    return this.tokensRepository.findByToken(token);
  }

  async deleteToken(token: string): Promise<any> {
    await this.tokensRepository.deleteById(token);
  }

  async createRecovery(dto: any) {
    await this.recoveryRepository.create(dto);
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
