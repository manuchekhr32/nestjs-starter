import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMobilePhone, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: '000000',
  })
  @IsString()
  otp: string;

  @ApiProperty({
    example: 'manuchehr@introdevs.org',
  })
  @IsEmail()
  @IsString()
  email: string;
}
