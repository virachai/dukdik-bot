import { Injectable, Logger } from '@nestjs/common';
import { WebhookRequestBody, WebhookEvent as LineWebhookEvent } from '@line/bot-sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageHandlerService } from './handlers/message-handler.service';
import { PostbackHandlerService } from './handlers/postback-handler.service';
import { LifecycleHandlerService } from './handlers/lifecycle-handler.service';
import { GoogleFormsService } from '../external/google-forms.service';
import { WebhookEvent as WebhookEventEntity } from '../database/entities/webhook-event.entity';

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);

    constructor(
        private readonly messageHandler: MessageHandlerService,
        private readonly postbackHandler: PostbackHandlerService,
        private readonly lifecycleHandler: LifecycleHandlerService,
        private readonly googleFormsService: GoogleFormsService,
        @InjectRepository(WebhookEventEntity)
        private readonly webhookRepository: Repository<WebhookEventEntity>,
    ) { }

    async dispatch(body: WebhookRequestBody): Promise<void> {
        this.logger.log(`Dispatching ${body.events.length} events`);

        // 1. Save to Postgres
        try {
            const eventRecord = this.webhookRepository.create({ payload: body });
            await this.webhookRepository.save(eventRecord);
            this.logger.log('Raw webhook payload saved to Postgres');
        } catch (error) {
            this.logger.error(`Failed to save webhook to Postgres: ${error.message}`);
        }

        // 2. Submit to Google Forms (legacy support)
        this.googleFormsService.submitData(body);

        // 3. Process events
        body.events.forEach((event: LineWebhookEvent) => {
            this.handleEvent(event).catch((err) => {
                this.logger.error(`Error handling event: ${err.message}`, err.stack);
            });
        });
    }

    private async handleEvent(event: LineWebhookEvent): Promise<void> {
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
