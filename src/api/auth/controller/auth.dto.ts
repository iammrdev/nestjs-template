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
  validate(email: string) {
    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  }
}

@ValidatorConstraint({ name: 'login', async: false })
export class CustomLoginValidator implements ValidatorConstraintInterface {
  validate(login: string) {
    return /^[a-zA-Z0-9_-]*$/.test(login);
  }
}

export class LoginDto {
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

export class RegistrationDto {
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

export class RegistrationConfirmationDto {
  @ApiProperty({ required: true })
  @IsString()
  public code: string;
}

export class RegistratioEmailResendingDto {
  @ApiProperty({ required: true })
  @Validate(CustomEmailValidator, { message: 'Invalid email' })
  public email: string;
}

export class PasswordRecoveryDto {
  @ApiProperty({ required: true })
  @Validate(CustomEmailValidator, { message: 'Invalid email' })
  public email: string;
}

export class NewPasswordDto {
  @ApiProperty({ required: true })
  public newPassword: string;

  @ApiProperty({ required: true })
  public recoveryCode: string;
}

export class RefreshTokenDto {
  @ApiProperty({ required: true })
  public accessToken: string;
}
