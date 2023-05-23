import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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

  async generateAuthInfo(dto: any) {
    // console.log({ dto });
    const payload = {
      sub: dto.id,
      email: dto.email,
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
      userId: dto.id,
      deviceId: uuidv4(),
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

    return this.tokensRepository.findByUserId(tokenInfo.sub);
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
