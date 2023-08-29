import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { checkPassword, hashPassword } from '../utils/bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JWTAccessOptions, JWTRefreshOptions } from '../global/config/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User, UserRole } from '@prisma/client';
import { VerificationService } from '../verification/verification.service';
import { EVerificationTypes } from '../types/verification';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private verificationService: VerificationService,
  ) {}

  private async generateTokens(
    user: Pick<User, 'id' | 'username'>,
    accessTokenOnly?: boolean,
  ) {
    const tokens = {
      accessToken: undefined,
      refreshToken: undefined,
    };

    tokens.accessToken = await this.jwtService.signAsync(
      {
        id: user.id,
        email: user.username,
      },
      JWTAccessOptions,
    );
    if (!accessTokenOnly) {
      tokens.refreshToken = await this.jwtService.signAsync(
        {
          id: user.id,
        },
        JWTRefreshOptions,
      );
    } else {
      delete tokens.refreshToken;
    }

    return tokens;
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: email,
      },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    if (await checkPassword(password, user.password)) {
      return user;
    }
    throw new UnauthorizedException();
  }

  async login(data: LoginDto) {
    const user = await this.validateUser(data.email, data.password);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    });
    return this.generateTokens(user);
  }

  async register(payload: RegisterDto) {
    await this.verificationService.checkConfirmOtp({
      type: EVerificationTypes.REGISTER,
      email: payload.email,
      otp: payload.otp,
    });
    const hashedPassword = await hashPassword(payload.password);
    const user = await this.prisma.user.create({
      data: {
        fullName: payload.fullName,
        password: hashedPassword,
        username: payload.email,
        role: UserRole.USER,
      },
      select: {
        id: true,
        username: true,
      },
    });
    return this.generateTokens(user);
  }

  async refreshToken(payload: RefreshTokenDto) {
    try {
      const jwtPayload = await this.jwtService.verifyAsync<{ id: number }>(
        payload.token,
        JWTRefreshOptions,
      );
      const user = await this.prisma.user.findUnique({
        where: {
          id: jwtPayload.id,
        },
        select: {
          id: true,
          username: true,
        },
      });
      if (!user) {
        throw new Error();
      }
      return this.generateTokens(user, true);
    } catch {
      throw new HttpException(
        'Invalid token or token expired',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async resetPassword(payload: ResetPasswordDto) {
    await this.verificationService.checkConfirmOtp({
      type: EVerificationTypes.RESET_PASSWORD,
      otp: payload.otp,
      email: payload.email,
    });
    const hashedPassword = await hashPassword(payload.password);
    await this.prisma.user.update({
      where: {
        username: payload.email,
      },
      data: {
        password: hashedPassword,
      },
    });
    return {
      success: true,
      message: 'New password successfully set',
    };
  }
}
