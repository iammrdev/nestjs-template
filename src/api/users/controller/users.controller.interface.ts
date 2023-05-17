import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

export class CreateUserDto {
  public login: string;
  public password: string;
  public email: string;
}

export class GetUsersQuery {
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
