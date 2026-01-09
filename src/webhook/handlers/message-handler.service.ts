import { Injectable, Logger } from '@nestjs/common';
import { MessageEvent } from '@line/bot-sdk';
import { GoogleFormsService } from '../../external/google-forms.service';

@Injectable()
export class MessageHandlerService {
    private readonly logger = new Logger(MessageHandlerService.name);

    constructor(private readonly googleFormsService: GoogleFormsService) { }

    async handle(event: MessageEvent): Promise<void> {
        this.logger.log(`Handling message event from user: ${event.source.userId}`);

        if (event.message.type === 'text') {
            const text = event.message.text;
            this.logger.log(`Received text: ${text}`);
        } else {
            this.logger.log(`Ignoring non-text message type: ${event.message.type}`);
        }
    }
}
