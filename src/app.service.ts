import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'LY Corporation - LINE Webhook Service is ONLINE';
  }
}
