import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import isAfter from 'date-fns/isAfter';
import { AuthService } from '../service/auth.service';
import {
  LoginDto,
  NewPasswordDto,
  PasswordRecoveryDto,
  RegistratioEmailResendingDto,
  RegistrationConfirmationDto,
  RegistrationDto,
} from './auth.dto';
import { UsersService } from '../../../api/users';
import { Response, Request } from 'express';
import { JwtAccessTokenGuard } from '../../../app/auth-jwt-access/jwt-access-token.guard';
import { CurrentUser } from '../../../core/pipes/current-user.pipe';
import { CurrentUserId } from '../../../core/pipes/current-user-id.pipe';
import { buildObject } from '../../../core/buildObject';
import { EmailService } from '../../../app/emails/email.service';

import { JwtRefreshTokenGuard } from '../../../app/auth-jwt-refresh/jwt-refresh-token.guard';
import { AuthMeRdo } from './auth.rdo';
import { RefreshTokenUserInfo } from '../../../app/auth-jwt-refresh/jwt-refresh-token.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request,
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const verifiedUser = await this.usersService.verifyUser(dto);

    const { accessToken, refreshToken } =
      await this.authService.generateAuthInfo({
        ...verifiedUser,
        userId: verifiedUser.id,
        ip: req.socket.remoteAddress || '0.0.0.0',
        title: req.headers['user-agent'] || 'none',
      });

    response.cookie('refreshToken', refreshToken, {
      secure: process.env.NODE_ENV !== 'development',
      httpOnly: true,
    });

    return { accessToken };
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() dto: RegistrationDto) {
    const newUser = await this.usersService.createUser(dto);

    await EmailService.sendEmail({
      email: newUser.email,
      code: newUser.confirmation.code,
    });
  }

  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Success',
  })
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() dto: RegistratioEmailResendingDto) {
    const user = await this.usersService.getUserByEmail(dto.email);

    if (!user || user.confirmation.status) {
      throw new BadRequestException({
        errorsMessages: [{ message: 'Invalid email', field: 'email' }],
      });
    }

    const newUser = await this.usersService.updateConfirmation(user.id);

    if (!newUser) {
      throw new BadRequestException({
        errorsMessages: [{ message: 'Invalid email', field: 'email' }],
      });
    }

    const info = await EmailService.sendEmail({
      email: newUser.email,
      code: newUser.confirmation.code,
    });

    if (!info.messageId) {
      throw new InternalServerErrorException('Server error');
    }
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() dto: RegistrationConfirmationDto) {
    const user = await this.usersService.getUserByConfirmationCode(dto.code);

    if (!user) {
      throw new BadRequestException({
        errorsMessages: [{ message: 'Invalid code', field: 'code' }],
      });
    }

    const isExp = isAfter(new Date(), user.confirmation.expiration);

    if (
      isExp ||
      user.confirmation.code !== dto.code ||
      user.confirmation.status
    ) {
      throw new BadRequestException({
        errorsMessages: [{ message: 'Invalid code', field: 'code' }],
      });
    }

    await this.usersService.activateUser(user.id);
  }

  @Get('me')
  @UseGuards(JwtAccessTokenGuard)
  public async updateUserData(@CurrentUserId() currentUserId: string) {
    const user = await this.usersService.getUserById(currentUserId);

    return buildObject(AuthMeRdo, user);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No content' })
  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Req() req: Request,
    @Body() dto: PasswordRecoveryDto,
  ) {
    const user = await this.usersService.getUserByEmail(dto.email);

    if (!user) {
      return;
    }

    const recovery = await this.authService.createRecovery({
      userId: user.id,
      ip: req.socket.remoteAddress || '0.0.0.0',
      title: req.headers['user-agent'] || 'none',
    });

    const info = await EmailService.sendRecoveryEmail({
      email: user.email,
      code: recovery.code,
    });

    if (!info.messageId) {
      throw new InternalServerErrorException('Server error');
    }
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No content' })
  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() dto: NewPasswordDto) {
    const recovery = await this.authService.getRecovery(dto.recoveryCode);

    if (!recovery) {
      throw new BadRequestException('Bad request');
    }

    const user = await this.usersService.updatePassword(
      recovery.userId,
      dto.newPassword,
    );

    return user;
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No content' })
  @Post('logout')
  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@CurrentUser() currentUser: RefreshTokenUserInfo) {
    const tokenInfo = await this.authService.getRefreshToken(
      currentUser.refreshToken,
    );

    if (!tokenInfo) {
      throw new UnauthorizedException('forbidden');
    }

    await this.authService.deleteToken(tokenInfo.id);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @UseGuards(JwtRefreshTokenGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @CurrentUser() currentUser: RefreshTokenUserInfo,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokenInfo = await this.authService.getRefreshToken(
      currentUser.refreshToken,
    );

    if (!tokenInfo) {
      throw new UnauthorizedException('forbidden');
    }

    await this.authService.deleteToken(tokenInfo.id);

    const { accessToken, refreshToken } =
      await this.authService.generateAuthInfo({
        userId: currentUser.id,
        login: currentUser.login,
        email: currentUser.email,
        deviceId: tokenInfo.deviceId,
        ip: req.socket.remoteAddress || '0.0.0.0',
        title: req.headers['user-agent'] || 'none',
      });

    response.cookie('refreshToken', refreshToken, {
      secure: process.env.NODE_ENV !== 'development',
      httpOnly: true,
    });

    return { accessToken };
  }
}
