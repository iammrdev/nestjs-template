import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/jwt/current-user.pipe';
import { UsersService } from '../../users';
import { JwtRefreshTokenGuard } from '../../auth/jwt/jwt-refresh-token.guard';
import { AuthService } from '../../auth/service/auth.service';

@ApiTags('security')
@Controller('security')
export class SecurityController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @UseGuards(JwtRefreshTokenGuard)
  @Get('devices')
  async getDevices(@CurrentUser() user: any) {
    return this.authService.getUserDevices(user.refreshToken);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @UseGuards(JwtRefreshTokenGuard)
  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevices(@CurrentUser() user: any) {
    await this.authService.terminateDevices(user.refreshToken);
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  @UseGuards(JwtRefreshTokenGuard)
  @Delete('devices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevice(@CurrentUser() user: any, @Param('id') id: string) {
    await this.authService.terminateDevice(user.refreshToken, id);
  }
}
