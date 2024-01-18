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

import { Response, Request } from 'express';
import { JwtAccessTokenGuard } from '../../../app/auth-jwt-access/jwt-access-token.guard';
import { CurrentUser } from '../../../core/pipes/current-user.pipe';
import { CurrentUserId } from '../../../core/pipes/current-user-id.pipe';
import { buildObject } from '../../../core/buildObject';
import { JwtRefreshTokenGuard } from '../../../app/auth-jwt-refresh/jwt-refresh-token.guard';
import {
  LoginUserCommand,
  LoginUserUseCaseResult,
} from '../use-case/login-user-use-case';
import {
  ResendRegistrationEmailCommand,
  ResendRegistrationEmailUseCaseResult,
} from '../use-case/resend-registration-email-use-case';
import {
  GenerateNewPasswordCommand,
  GenerateNewPasswordUseCaseResult,
} from '../use-case/generate-new-password-use-case';
import {
  ConfirmRegistrationCommand,
  ConfirmRegistrationUseCaseResult,
} from '../use-case/confirm-registration-use-case';
import {
  RecoveryPasswordCommand,
  RecoveryPasswordUseCaseResult,
} from '../use-case/recovery-password-use-case.ts';
import {
  GenerateNewTokensCommand,
  GenerateNewTokensUseCaseResult,
} from '../use-case/generate-new-tokens-use-case';
import {
  LogoutUserCommand,
  LogoutUserUseCaseResult,
} from '../use-case/logout-user-use-case';
import { UsersRepository } from '../../users/repository';
import {
  CreateUserCommand,
  CreateUserUseCaseResult,
} from '../../users/use-case/create-user-use-case';
import { EmailService } from '../../../app/emails/email.service';
import { AuthUser } from '../../../types/auth';
import {
  PostLoginDto,
  PostNewPasswordDto,
  PostPasswordRecoveryDto,
  PostRegistratioEmailResendingDto,
  PostRegistrationConfirmationDto,
  PostRegistrationDto,
} from './auth.dto';
import {
  GetMeRdo,
  PostLoginRdo,
  PostNewPasswordRdo,
  PostRefreshTokenRdo,
} from './auth.rdo';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
  ) {}

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No content' })
  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Req() req: Request,
    @Body() dto: PostPasswordRecoveryDto,
  ): Promise<void> {
    const command = new RecoveryPasswordCommand({
      email: dto.email,
      ip: req.socket.remoteAddress || '0.0.0.0',
      userAgent: req.headers['user-agent'] || 'none',
    });

    await this.commandBus.execute<
      RecoveryPasswordCommand,
      RecoveryPasswordUseCaseResult
    >(command);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No content' })
  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(
    @Body() dto: PostNewPasswordDto,
  ): Promise<PostNewPasswordRdo> {
    const command = new GenerateNewPasswordCommand(dto);

    return this.commandBus.execute<
      GenerateNewPasswordCommand,
      GenerateNewPasswordUseCaseResult
    >(command);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request,
    @Body() dto: PostLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PostLoginRdo> {
    const command = new LoginUserCommand({
      ...dto,
      ip: req.socket.remoteAddress || '0.0.0.0',
      userAgent: req.headers['user-agent'] || 'none',
    });

    const { accessToken, refreshToken } = await this.commandBus.execute<
      LoginUserCommand,
      LoginUserUseCaseResult
    >(command);

    res.cookie('refreshToken', refreshToken, {
      secure: process.env.NODE_ENV !== 'development',
      httpOnly: true,
    });

    return { accessToken };
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @UseGuards(JwtRefreshTokenGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @CurrentUser() currentUser: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PostRefreshTokenRdo> {
    const command = new GenerateNewTokensCommand({
      userInfo: currentUser,
      ip: req.socket.remoteAddress || '0.0.0.0',
      userAgent: req.headers['user-agent'] || 'none',
    });

    const { accessToken, refreshToken } = await this.commandBus.execute<
      GenerateNewTokensCommand,
      GenerateNewTokensUseCaseResult
    >(command);

    res.cookie('refreshToken', refreshToken, {
      secure: process.env.NODE_ENV !== 'development',
      httpOnly: true,
    });

    return { accessToken };
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body() dto: PostRegistrationConfirmationDto,
  ): Promise<void> {
    const command = new ConfirmRegistrationCommand(dto);

    await this.commandBus.execute<
      ConfirmRegistrationCommand,
      ConfirmRegistrationUseCaseResult
    >(command);
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() dto: PostRegistrationDto): Promise<void> {
    const command = new CreateUserCommand(dto);

    const createdUser = await this.commandBus.execute<
      CreateUserCommand,
      CreateUserUseCaseResult
    >(command);

    await EmailService.sendEmail({
      email: createdUser.email,
      code: createdUser.confirmation.code,
    });
  }

  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Success',
  })
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(
    @Body() dto: PostRegistratioEmailResendingDto,
  ): Promise<void> {
    const command = new ResendRegistrationEmailCommand(dto);

    await this.commandBus.execute<
      ResendRegistrationEmailCommand,
      ResendRegistrationEmailUseCaseResult
    >(command);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No content' })
  @Post('logout')
  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@CurrentUser() currentUser: AuthUser): Promise<void> {
    const command = new LogoutUserCommand({ userInfo: currentUser });

    await this.commandBus.execute<LogoutUserCommand, LogoutUserUseCaseResult>(
      command,
    );
  }

  @Get('me')
  @UseGuards(JwtAccessTokenGuard)
  public async updateUserData(
    @CurrentUserId() currentUserId: string,
  ): Promise<GetMeRdo> {
    const user = await this.usersRepository.findById(currentUserId);

    return buildObject(GetMeRdo, user);
  }
}
