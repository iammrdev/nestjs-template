import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'url', async: false })
export class CustomUrlValidator implements ValidatorConstraintInterface {
  validate(url: string) {
    return /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/.test(
      url,
    );
  }
}

export class CreateBlogDto {
  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(15, { message: 'Invalid name' })
  public name: string;

  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(500, { message: 'Invalid description' })
  public description: string;

  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(100, { message: 'Invalid websiteUrl' })
  @Validate(CustomUrlValidator, { message: 'Invalid websiteUrl' })
  public websiteUrl: string;
}

export class UpdateBlogDto {
  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(15, { message: 'Invalid name' })
  public name: string;

  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(500, { message: 'Invalid description' })
  public description: string;

  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(100, { message: 'Invalid websiteUrl' })
  @Validate(CustomUrlValidator, { message: 'Invalid websiteUrl' })
  public websiteUrl: string;
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

export class CreatePostDto {
  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(30, { message: 'Invalid title length' })
  public title: string;

  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(100, { message: 'Invalid shortDescription length' })
  public shortDescription: string;

  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Invalid content length' })
  public content: string;
}

export class UpdatePostDto {
  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(30, { message: 'Invalid title length' })
  public title: string;

  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(100, { message: 'Invalid shortDescription length' })
  public shortDescription: string;

  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Invalid content length' })
  public content: string;
}

export class BanBlogUserDto {
  @ApiProperty({ required: true })
  @IsBoolean()
  public isBanned: boolean;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(20, { message: 'Invalid ban reason length' })
  public banReason: string;

  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  public blogId: string;
}

export class GetBannedUsersQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  public searchLoginTerm = '';

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

export class GetUserCommentsQuery {
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
