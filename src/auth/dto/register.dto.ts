import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMobilePhone, IsString, MinLength } from 'class-validator';

export class RegisterSendOtp {
  @ApiProperty({
    example: 'manuchehr@introdevs.org',
  })
  @IsEmail()
  @IsString()
  email: string;
}

export class RegisterVerifyDto extends RegisterSendOtp {
  @ApiProperty({
    example: '000000',
  })
  @IsString()
  otp: string;
}

export class RegisterDto extends RegisterVerifyDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;
}
