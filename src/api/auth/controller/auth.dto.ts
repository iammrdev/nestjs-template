import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  Length,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'email', async: false })
export class CustomEmailValidator implements ValidatorConstraintInterface {
  validate(email: string): boolean {
    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  }
}

@ValidatorConstraint({ name: 'login', async: false })
export class CustomLoginValidator implements ValidatorConstraintInterface {
  validate(login: string): boolean {
    return /^[a-zA-Z0-9_-]*$/.test(login);
  }
}

export class PostLoginDto {
  @ApiProperty({
    required: true,
    description: 'User email',
    example: 'user@test.local',
  })
  @IsString()
  public loginOrEmail: string;

  @ApiProperty({
    required: true,
    description: 'User password',
    example: '123456',
  })
  @IsString()
  public password: string;
}

export class PostRegistrationDto {
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

export class PostRegistrationConfirmationDto {
  @ApiProperty({ required: true })
  @IsString()
  public code: string;
}

export class PostRegistratioEmailResendingDto {
  @ApiProperty({ required: true })
  @Validate(CustomEmailValidator, { message: 'Invalid email' })
  public email: string;
}

export class PostPasswordRecoveryDto {
  @ApiProperty({ required: true })
  @Validate(CustomEmailValidator, { message: 'Invalid email' })
  public email: string;
}

export class PostNewPasswordDto {
  @ApiProperty({ required: true })
  public newPassword: string;

  @ApiProperty({ required: true })
  public recoveryCode: string;
}

export class RefreshTokenDto {
  @ApiProperty({ required: true })
  public accessToken: string;
}
