import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/pipes/current-user.pipe';
import { JwtRefreshTokenGuard } from '../../app/auth-jwt-refresh/jwt-refresh-token.guard';
import { AuthService } from '../auth/service/auth.service';
import { AuthUser } from '../../types/auth';
import { GetDevicesRdo } from './security.controller.rdo';

@ApiTags('security')
@Controller('security')
export class SecurityController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @UseGuards(JwtRefreshTokenGuard)
  @Get('devices')
  async getDevices(@CurrentUser() user: AuthUser): Promise<GetDevicesRdo> {
    const devices = await this.authService.getUserDevices(user.refreshToken);

    return devices.map((device) => ({
      ip: device.ip,
      title: device.title,
      deviceId: device.deviceId,
      lastActiveDate: device.iat,
    }));
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @UseGuards(JwtRefreshTokenGuard)
  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevices(@CurrentUser() user: AuthUser): Promise<void> {
    await this.authService.terminateDevices(user.refreshToken);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  @UseGuards(JwtRefreshTokenGuard)
  @Delete('devices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevice(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.authService.terminateDevice(user.refreshToken, id);
  }
}
