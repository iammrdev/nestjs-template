import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { LikeStatus } from '../../../types/likes';

export class GetCommentsQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  public sortBy = 'createdAt';

  @ApiProperty({ enum: ['asc', 'desc'], required: false })
  @IsIn(['desc', 'asc'])
  @IsOptional()
  public sortDirection: 'desc' | 'asc' = 'desc';

  @ApiProperty({ required: false })
  @Transform(({ value }) => Number(value) || 1)
  @IsOptional()
  public pageNumber = 1;

  @ApiProperty({ required: false })
  @Transform(({ value }) => Number(value) || 10)
  @IsOptional()
  public pageSize = 10;
}

export class UpdateCommentDto {
  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @MinLength(20, { message: 'Invalid content length' })
  @MaxLength(300, { message: 'Invalid content length' })
  public content: string;
}

export class UpdateCommentLikeStatusDto {
  @ApiProperty({ required: true })
  @IsIn(['None', 'Like', 'Dislike'], { message: 'Invalid like status' })
  public likeStatus: LikeStatus;
}
