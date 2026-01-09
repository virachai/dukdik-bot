import { Injectable, Logger } from '@nestjs/common';
import { PostbackEvent } from '@line/bot-sdk';
import { GoogleFormsService } from '../../external/google-forms.service';

@Injectable()
export class PostbackHandlerService {
    private readonly logger = new Logger(PostbackHandlerService.name);

    constructor(private readonly googleFormsService: GoogleFormsService) { }

    async handle(event: PostbackEvent): Promise<void> {
        this.logger.log(`Handling postback event: ${event.postback.data}`);

        // Example logic: Submit postback data to Google Forms
        await this.googleFormsService.submitData(`Postback: ${event.postback.data} | User: ${event.source.userId}`);
    }
}
