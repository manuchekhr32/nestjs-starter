import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMobilePhone, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'manuchehr@introdevs.org',
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}
