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
  validate(id: string): boolean {
    return Types.ObjectId.isValid(id);
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

export class PostDto {
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

export class PutByIdDto {
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

export class GetQuery {
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

export class PutLikeStatusByIdDto {
  @ApiProperty({ required: true })
  @IsIn(['None', 'Like', 'Dislike'], { message: 'Invalid like status' })
  public likeStatus: LikeStatus;
}

export class PostCommentsByIdDto {
  @ApiProperty({ required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @MinLength(20, { message: 'Invalid content length' })
  @MaxLength(300, { message: 'Invalid content length' })
  public content: string;
}

export class GetCommentsByIdQuery {
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
