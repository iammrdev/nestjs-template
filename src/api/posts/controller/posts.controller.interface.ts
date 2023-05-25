import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
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
import { Types } from 'mongoose';
import { BlogsService } from '../../blogs';
import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../../types/likes';

@ValidatorConstraint({ name: 'invalid mongo id', async: false })
export class MongoIdValidator implements ValidatorConstraintInterface {
  validate(id: string) {
    return Types.ObjectId.isValid(id);
  }
}

@ValidatorConstraint({ name: 'invalid blog', async: true })
@Injectable()
export class BlogIdValidator implements ValidatorConstraintInterface {
  constructor(private readonly blogsService: BlogsService) {}

  async validate(id: string) {
    const blog = await this.blogsService.getBlogById(id);

    return Boolean(blog);
  }
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

  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @Validate(MongoIdValidator, { message: 'Invalid blogId' })
  @Validate(BlogIdValidator, { message: 'Invalid blogId' })
  public blogId: string;
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

  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @Validate(MongoIdValidator, { message: 'Invalid blogId' })
  @Validate(BlogIdValidator, { message: 'Invalid blogId' })
  public blogId: string;
}

export class GetPostsQuery {
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

export class CreateCommentDto {
  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @MinLength(20, { message: 'Invalid content length' })
  @MaxLength(300, { message: 'Invalid content length' })
  public content: string;
}

export class UpdatePostLikeStatusDto {
  @ApiProperty({ required: true })
  @IsIn(['None', 'Like', 'Dislike'], { message: 'Invalid like status' })
  public likeStatus: LikeStatus;
}
