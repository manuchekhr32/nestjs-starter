import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EVerificationTypes, ICheckOtp } from '../types/verification';
import { generateOtp } from '../utils/random';
import { secToMills } from '../utils/time';
import { SendOtpDto, VerifyOtpDto } from './dto/verification.dto';
import { EmailService } from '../global/services/email.service';
import { OTPCachePayload } from '../types/cache';

@Injectable()
export class VerificationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    @Inject(CACHE_MANAGER) private cacheStore: Cache,
  ) {}

  public getKey(
    type: EVerificationTypes,
    phone: string,
    confirmation?: boolean,
  ) {
    const storeKeys: Record<EVerificationTypes, string> = {
      [EVerificationTypes.REGISTER]: 'reg_',
      [EVerificationTypes.RESET_PASSWORD]: 'respass_',
      [EVerificationTypes.EDIT_EMAIL]: 'edem_',
    };
    let key = storeKeys[type];
    if (confirmation) {
      key += 'cfm_';
    }
    key += phone;
    return key;
  }

  private getMessage(type: EVerificationTypes, otp: string) {
    switch (type) {
      case EVerificationTypes.REGISTER:
        return `Confirmation code for registration: ${otp}. Don't share!`;
      case EVerificationTypes.RESET_PASSWORD:
        return `Confirmation code to reset password: ${otp}. Don't share!`;
      case EVerificationTypes.EDIT_EMAIL:
        return `Confirmation code to change your email: ${otp}. Don't share!`;
    }
  }

  private async throwIfUserExists(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: email,
      },
    });
    if (user) {
      throw new HttpException('Phone already used', HttpStatus.BAD_REQUEST);
    }
    return user;
  }

  private async throwIfUserNotExists(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: email,
      },
    });
    if (!user) {
      throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async sendOtp(payload: SendOtpDto) {
    const { type, email } = payload;
    const key = this.getKey(type, email);
    const session = await this.cacheStore.get(key);

    if (session) {
      throw new HttpException(
        'Code already sent to user',
        HttpStatus.BAD_REQUEST,
      );
    }

    switch (type) {
      case EVerificationTypes.REGISTER:
        await this.throwIfUserExists(email);
        break;
      case EVerificationTypes.EDIT_EMAIL:
        await this.throwIfUserExists(email);
        break;
      case EVerificationTypes.RESET_PASSWORD:
        await this.throwIfUserNotExists(email);
        break;
    }

    const otp = generateOtp();
    await this.cacheStore.set(
      key,
      {
        otp,
      },
      secToMills(120),
    );
    await this.emailService.sendEmail(this.getMessage(type, otp));
    return { message: 'Confirmation code sent' };
  }

  async verifyOtp(payload: VerifyOtpDto) {
    const { type, email, otp } = payload;
    const session = await this.cacheStore.get<OTPCachePayload>(
      this.getKey(type, email),
    );

    if (!session) {
      throw new HttpException('OTP expired!', HttpStatus.BAD_REQUEST);
    }

    if (otp !== session.otp) {
      throw new HttpException('Invalid OTP!', HttpStatus.BAD_REQUEST);
    }

    await this.cacheStore.del(this.getKey(type, email));
    await this.cacheStore.set(
      this.getKey(type, email, true),
      {
        otp,
      },
      secToMills(300),
    );

    return {
      success: true,
      message: 'Verified',
    };
  }

  public async checkConfirmOtp(payload: ICheckOtp) {
    const { type, email, otp } = payload;
    const session = await this.cacheStore.get<OTPCachePayload>(
      this.getKey(type, email, true),
    );

    if (!session) {
      throw new HttpException('Session expired!', HttpStatus.BAD_REQUEST);
    }

    if (otp !== session.otp) {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }

    await this.cacheStore.del(this.getKey(type, email, true));
    return true;
  }
}
