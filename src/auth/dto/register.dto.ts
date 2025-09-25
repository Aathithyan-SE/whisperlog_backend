import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'john_doe', description: 'Unique username' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'john@example.com', description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePassword123', description: 'User password (minimum 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;
}
