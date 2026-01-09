import { Injectable, Logger } from '@nestjs/common';
import { WebhookRequestBody, WebhookEvent } from '@line/bot-sdk';
import { MessageHandlerService } from './handlers/message-handler.service';
import { PostbackHandlerService } from './handlers/postback-handler.service';
import { LifecycleHandlerService } from './handlers/lifecycle-handler.service';
import { GoogleFormsService } from '../external/google-forms.service';

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);

    constructor(
        private readonly messageHandler: MessageHandlerService,
        private readonly postbackHandler: PostbackHandlerService,
        private readonly lifecycleHandler: LifecycleHandlerService,
        private readonly googleFormsService: GoogleFormsService,
    ) { }

    async dispatch(body: WebhookRequestBody): Promise<void> {
        this.logger.log(`Dispatching ${body.events.length} events`);

        // Submit raw payload to Google Forms as requested
        this.googleFormsService.submitData(body);

        // Process events in parallel but don't wait for completion to respond to LINE quickly
        // LINE platform expects a 200 OK within seconds.
        // If we have heavy logic, we should use a queue or at least not await the entire process in the controller.
        body.events.forEach((event) => {
            this.handleEvent(event).catch((err) => {
                this.logger.error(`Error handling event: ${err.message}`, err.stack);
            });
        });
    }

    private async handleEvent(event: WebhookEvent): Promise<void> {
        switch (event.type) {
            case 'message':
                return this.messageHandler.handle(event);
            case 'postback':
                return this.postbackHandler.handle(event);
            case 'follow':
                return this.lifecycleHandler.handleFollow(event);
            case 'unfollow':
                return this.lifecycleHandler.handleUnfollow(event);
            default:
                this.logger.log(`Unsupported event type: ${event.type}`);
        }
    }
}
