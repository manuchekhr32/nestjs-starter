import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JWTAccessOptions } from '../global/config/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { VerificationService } from '../verification/verification.service';
import { VerificationModule } from '../verification/verification.module';

@Module({
  imports: [
    PassportModule,
    VerificationModule,
    JwtModule.register({
      secret: JWTAccessOptions.secret,
      signOptions: {
        expiresIn: JWTAccessOptions.expiresIn,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    LocalStrategy,
    JwtStrategy,
    JwtService,
    VerificationService,
  ],
})
export class AuthModule {}
