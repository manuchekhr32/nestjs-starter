import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';
import { EVerificationTypes } from '../../types/verification';

export class SendOtpDto {
  @ApiProperty({
    enum: EVerificationTypes,
  })
  @IsEnum(EVerificationTypes)
  type: EVerificationTypes;

  @ApiProperty({
    example: 'manuchehr@introdevs.org',
  })
  @IsEmail()
  @IsString()
  email: string;
}

export class VerifyOtpDto extends SendOtpDto {
  @ApiProperty({
    example: '000000',
  })
  @IsString()
  otp: string;
}
