import { Injectable } from '@nestjs/common';
import { generateOtp } from '../../utils/random';

@Injectable()
export class EmailService {
  public async sendEmail(message: string) {
    console.log(message);
    return true;
  }
}
