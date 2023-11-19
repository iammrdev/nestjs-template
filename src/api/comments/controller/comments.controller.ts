import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommentsService } from '../service/comments.service';
import { JwtAccessTokenGuard } from '../../../app/auth-jwt-access/jwt-access-token.guard';
import { CurrentUserId } from '../../../core/pipes/current-user-id.pipe';
import { UsersService } from '../../users';
import { JwtAccessTokenInfo } from '../../../app/auth-jwt-access/jwt-access-token.info';
import { PutByIdDto, PutLikeStatusByIdDto } from './comments.controller.dto';
import {
  GetByIdRdo,
  PutByIdRdo,
  PutLikeStatusByIdRdo,
} from './comments.controller.rdo';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly usersService: UsersService,
  ) {}

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Get(':id')
  @UseGuards(JwtAccessTokenInfo)
  async getComment(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ): Promise<GetByIdRdo> {
    const existedComment = await this.commentsService.getCommentById(id, {
      userId,
    });

    if (!existedComment) {
      throw new NotFoundException('Comment is not found');
    }

    return existedComment;
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @Put(':id')
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @CurrentUserId() currentUserId: string,
    @Param('id') id: string,
    @Body() dto: PutByIdDto,
  ): Promise<PutByIdRdo> {
    const existedUser = await this.usersService.getUserById(currentUserId);

    if (!existedUser) {
      throw new NotFoundException('User is not found');
    }

    return this.commentsService.updateCommentById(id, {
      content: dto.content,
      userId: existedUser.id,
    });
  }

  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  @Delete(':id')
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.commentsService.deleteCommentById(id, { userId });
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @Put(':id/like-status')
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateCommentLikeStatus(
    @CurrentUserId() currentUserId: string,
    @Param('id') id: string,
    @Body() dto: PutLikeStatusByIdDto,
  ): Promise<PutLikeStatusByIdRdo> {
    const existedUser = await this.usersService.getUserById(currentUserId);

    if (!existedUser) {
      throw new NotFoundException('User is not found');
    }

    return this.commentsService.updateCommentLikeStatusById(id, {
      likeStatus: dto.likeStatus,
      userId: existedUser.id,
    });
  }
}
