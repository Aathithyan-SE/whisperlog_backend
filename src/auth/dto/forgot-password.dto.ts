import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'john@example.com', description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'john@example.com', description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', description: 'OTP received via email' })
  @IsNotEmpty()
  otp: string;

  @ApiProperty({ example: 'NewSecurePassword123', description: 'New password' })
  @IsNotEmpty()
  newPassword: string;
}
