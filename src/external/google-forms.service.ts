import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GoogleFormsService {
  private readonly logger = new Logger(GoogleFormsService.name);
  private readonly formUrl: string;
  private readonly entryId: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.formUrl = this.configService.get<string>('GOOGLE_FORM_URL', 'https://docs.google.com/forms/d/e/xxxxx/formResponse');
    this.entryId = this.configService.get<string>('GOOGLE_FORM_ENTRY_ID', 'entry.123000');
  }

  /**
   * Submits data to Google Forms asynchronously.
   * This does not block the webhook response.
   */
  async submitData(data: any): Promise<void> {
    try {
      const stringifiedData = typeof data === 'string' ? data : JSON.stringify(data);
      const params = new URLSearchParams();
      params.append(this.entryId, stringifiedData);

      this.logger.log(`Submitting data to Google Forms: ${stringifiedData}`);

      firstValueFrom(this.httpService.post(this.formUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })).then(() => {
        this.logger.log('Google Forms submission successful');
      }).catch((error) => {
        this.logger.error(`Google Forms submission failed: ${error.message}`);
      });

    } catch (error) {
      this.logger.error(`Error preparing Google Forms submission: ${error.message}`);
    }
  }
}
