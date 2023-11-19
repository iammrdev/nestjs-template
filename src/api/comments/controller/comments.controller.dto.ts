import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { LikeStatus } from '../../../types/likes';

export class PutByIdDto {
  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @MinLength(20, { message: 'Invalid content length' })
  @MaxLength(300, { message: 'Invalid content length' })
  public content: string;
}

export class PutLikeStatusByIdDto {
  @ApiProperty({ required: true })
  @IsIn(['None', 'Like', 'Dislike'], { message: 'Invalid like status' })
  public likeStatus: LikeStatus;
}
