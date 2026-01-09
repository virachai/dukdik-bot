import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Logger } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { LineSignatureGuard } from '../common/guards/line-signature.guard';
import { WebhookRequestBody } from '@line/bot-sdk';

@Controller('webhook')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(private readonly webhookService: WebhookService) { }

    @Post('line')
    @HttpCode(HttpStatus.OK)
    @UseGuards(LineSignatureGuard)
    async handleLineWebhook(@Body() body: WebhookRequestBody) {
        this.logger.log('Received LINE webhook request');

        // Pass events to service for dispatching
        // We return 200 OK immediately after dispatching starts
        await this.webhookService.dispatch(body);

        return { status: 'success' };
    }
}
