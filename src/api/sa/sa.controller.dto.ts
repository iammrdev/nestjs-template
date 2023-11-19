import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MinLength,
  Validate,
} from 'class-validator';
import {
  CustomEmailValidator,
  CustomLoginValidator,
} from '../auth/controller/auth.dto';

export class PostUsersDto {
  @ApiProperty({ required: true })
  @IsString()
  @Length(3, 10, { message: 'Invalid login length' })
  @Validate(CustomLoginValidator, { message: 'Invalid login' })
  public login: string;

  @ApiProperty({ required: true })
  @IsString()
  @Length(6, 20, { message: 'Invalid password length' })
  public password: string;

  @ApiProperty({ required: true })
  @Validate(CustomEmailValidator, { message: 'Invalid email' })
  public email: string;
}

export class GetUsersQuery {
  @ApiProperty({ enum: ['all', 'banned', 'notBanned'], required: false })
  @IsIn(['all', 'banned', 'notBanned'])
  @IsOptional()
  public banStatus: 'all' | 'banned' | 'notBanned';

  @ApiProperty({ required: false })
  @IsOptional()
  public searchLoginTerm = '';

  @ApiProperty({ required: false })
  @IsOptional()
  public searchEmailTerm = '';

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

export class GetBlogsQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  public searchNameTerm = '';

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

export class PutBanByUserDto {
  @ApiProperty({ required: true })
  @IsBoolean()
  @Validate(CustomLoginValidator, { message: 'Invalid ban status' })
  public isBanned: boolean;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(20, { message: 'Invalid ban reason length' })
  public banReason: string;
}

export class PutBanByBlogDto {
  @ApiProperty({ required: true })
  @IsBoolean()
  @Validate(CustomLoginValidator, { message: 'Invalid ban status' })
  public isBanned: boolean;
}
