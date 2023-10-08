import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  LoginDto,
  NewPasswordDto,
  PasswordRecoveryDto,
  RegistratioEmailResendingDto,
  RegistrationConfirmationDto,
  RegistrationDto,
} from './auth.dto';
import { Response, Request } from 'express';
import { JwtAccessTokenGuard } from '../../../app/auth-jwt-access/jwt-access-token.guard';
import { CurrentUser } from '../../../core/pipes/current-user.pipe';
import { CurrentUserId } from '../../../core/pipes/current-user-id.pipe';
import { buildObject } from '../../../core/buildObject';

import { JwtRefreshTokenGuard } from '../../../app/auth-jwt-refresh/jwt-refresh-token.guard';
import { AuthMeRdo } from './auth.rdo';
import { RefreshTokenUserInfo } from '../../../app/auth-jwt-refresh/jwt-refresh-token.strategy';
import { LoginUserCommand } from '../use-case/login-user-use-case';
import { RegisterUserCommand } from '../use-case/register-user-use-case.ts';
import { ResendRegistrationEmailCommand } from '../use-case/resened-registration-email-use-case';
import { GenerateNewPasswordCommand } from '../use-case/generate-new-password-use-case';
import { ConfirmRegistrationCommand } from '../use-case/confirm-registration-use-case';
import { RecoveryPasswordCommand } from '../use-case/recovery-password-use-case.ts';
import { GenerateNewTokensCommand } from '../use-case/generate-new-tokens-use-case';
import { LogoutUserCommand } from '../use-case/logout-user-use-case';
import { UsersRepository } from '../../users/repository/users.repository';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
  ) {}

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request,
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const command = new LoginUserCommand({
      ...dto,
      ip: req.socket.remoteAddress || '0.0.0.0',
      userAgent: req.headers['user-agent'] || 'none',
    });

    const tokens = await this.commandBus.execute(command);

    res.cookie('refreshToken', tokens.refreshToken, {
      secure: process.env.NODE_ENV !== 'development',
      httpOnly: true,
    });

    return { accessToken: tokens.accessToken };
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() dto: RegistrationDto) {
    const command = new RegisterUserCommand(dto);

    await this.commandBus.execute(command);
  }

  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Success',
  })
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() dto: RegistratioEmailResendingDto) {
    const command = new ResendRegistrationEmailCommand(dto);

    await this.commandBus.execute(command);
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() dto: RegistrationConfirmationDto) {
    const command = new ConfirmRegistrationCommand(dto);

    await this.commandBus.execute(command);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No content' })
  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Req() req: Request,
    @Body() dto: PasswordRecoveryDto,
  ) {
    const command = new RecoveryPasswordCommand({
      email: dto.email,
      ip: req.socket.remoteAddress || '0.0.0.0',
      userAgent: req.headers['user-agent'] || 'none',
    });

    await this.commandBus.execute(command);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No content' })
  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() dto: NewPasswordDto) {
    const command = new GenerateNewPasswordCommand(dto);

    return this.commandBus.execute(command);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @UseGuards(JwtRefreshTokenGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @CurrentUser() currentUser: RefreshTokenUserInfo,
    @Res({ passthrough: true }) res: Response,
  ) {
    const command = new GenerateNewTokensCommand({
      userInfo: currentUser,
      ip: req.socket.remoteAddress || '0.0.0.0',
      userAgent: req.headers['user-agent'] || 'none',
    });

    const { accessToken, refreshToken } = await this.commandBus.execute(
      command,
    );

    res.cookie('refreshToken', refreshToken, {
      secure: process.env.NODE_ENV !== 'development',
      httpOnly: true,
    });

    return { accessToken };
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No content' })
  @Post('logout')
  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@CurrentUser() currentUser: RefreshTokenUserInfo) {
    const command = new LogoutUserCommand({ userInfo: currentUser });

    await this.commandBus.execute(command);
  }

  @Get('me')
  @UseGuards(JwtAccessTokenGuard)
  public async updateUserData(@CurrentUserId() currentUserId: string) {
    const user = await this.usersRepository.findById(currentUserId);

    return buildObject(AuthMeRdo, user);
  }
}
