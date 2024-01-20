import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  CustomEmailValidator,
  CustomLoginValidator,
} from '../auth/controller/auth.dto';
import { Injectable } from '@nestjs/common';
import { BlogsService } from '../blogs';

@ValidatorConstraint({ name: 'url', async: false })
export class CustomUrlValidator implements ValidatorConstraintInterface {
  validate(url: string): boolean {
    return /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/.test(
      url,
    );
  }
}

@ValidatorConstraint({ name: 'invalid blog', async: true })
@Injectable()
export class BlogIdValidator implements ValidatorConstraintInterface {
  constructor(private readonly blogsService: BlogsService) {}

  async validate(id: string): Promise<boolean> {
    const blog = await this.blogsService.getBlogById(id);

    return Boolean(blog);
  }
}

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

export class PostBlogsDto {
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

export class PutBlogsByIdDto {
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

export class PostPostsByBlogIdDto {
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

export class GetPostsByBlogIdQuery {
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

export class PutPostsByBlogIdDto {
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
