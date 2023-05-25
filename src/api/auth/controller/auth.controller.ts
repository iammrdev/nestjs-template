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
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
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
import { JwtAccessTokenGuard } from '../jwt/jwt-access-token.guard';
import { CurrentUser, CurrentUserId } from '../jwt/current-user.pipe';
import { Expose } from 'class-transformer';
import { buildObject } from '../../../core/buildObject';
import { EmailService } from '../../../services/emails/email.service';
import isAfter from 'date-fns/isAfter';
import { JwtRefreshTokenGuard } from '../jwt/jwt-refresh-token.guard';

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
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const verifiedUser = await this.usersService.verifyUser(dto);

    const { accessToken, refreshToken } =
      await this.authService.generateAuthInfo(verifiedUser);

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
        errorsMessages: [
          {
            message: 'Invalid email',
            field: 'email',
          },
        ],
      });
    }

    const newUser = await this.usersService.updateConfirmation(user.id);

    if (!newUser) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Invalid email 2',
            field: 'email',
          },
        ],
      });
    }

    console.log({ newUser });

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
        errorsMessages: [
          {
            message: 'Invalid code',
            field: 'code',
          },
        ],
      });
    }

    const isExp = isAfter(new Date(), user.confirmation.expiration);

    if (
      isExp ||
      user.confirmation.code !== dto.code ||
      user.confirmation.status
    ) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Invalid code 2',
            field: 'code',
          },
        ],
      });
    }

    await this.usersService.activateUser(user.id);
  }

  @Get('me')
  @UseGuards(JwtAccessTokenGuard)
  public async updateUserData(@CurrentUserId() currentUser: any) {
    const user = await this.usersService.getUserById(currentUser);

    return buildObject(UserRdo, user);
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

    const recovery = {
      userId: user.id,
      deviceId: uuidv4(),
      ip: req.socket.remoteAddress,
      title: req.headers['user-agent'],
      code: uuidv4(),
      iat: new Date(),
      exp: add(new Date(), { minutes: 60 }),
    };

    await this.authService.createRecovery(recovery);

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
  public async logout(@CurrentUser() currentUser: any) {
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
    @CurrentUser() currentUser: any,
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
        id: currentUser.id,
        login: currentUser.login,
        email: currentUser.email,
      });

    response.cookie('refreshToken', refreshToken, {
      secure: process.env.NODE_ENV !== 'development',
      httpOnly: true,
    });

    return { accessToken };
  }
}

export class UserRdo {
  @Expose()
  public email: string;

  @Expose()
  public login: string;

  @Expose({ name: 'id' })
  public userId: number;
}
