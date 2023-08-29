import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { EmailService } from '../global/services/email.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [VerificationController],
  providers: [VerificationService, PrismaService, EmailService],
  exports: [
    VerificationService,
    VerificationService,
    PrismaService,
    EmailService,
  ],
})
export class VerificationModule {}
