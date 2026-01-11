import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { messagingApi } from '@line/bot-sdk';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LineApiService {
    private readonly logger = new Logger(LineApiService.name);
    private readonly blobClient: messagingApi.MessagingApiBlobClient;
    private readonly messagingClient: messagingApi.MessagingApiClient;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        const accessToken = this.configService.get<string>('LINE_CHANNEL_ACCESS_TOKEN') || '';
        this.blobClient = new messagingApi.MessagingApiBlobClient({
            channelAccessToken: accessToken,
        });
        this.messagingClient = new messagingApi.MessagingApiClient({
            channelAccessToken: accessToken,
        });
    }

    /**
     * Sends a reply message to the user.
     */
    async replyMessage(replyToken: string, messages: any[]): Promise<void> {
        try {
            await this.messagingClient.replyMessage({
                replyToken,
                messages,
            });
        } catch (error) {
            this.logger.error(`Failed to send reply message: ${error.message}`);
            throw error;
        }
    }

    /**
     * Sends a simple text message to a user (push).
     */
    async pushMessage(userId: string, messages: any[]): Promise<void> {
        try {
            await this.messagingClient.pushMessage({
                to: userId,
                messages,
            });
        } catch (error) {
            this.logger.error(`Failed to push message: ${error.message}`);
            throw error;
        }
    }

    /**
     * Fetches the content of a message (image, video, etc.)
     * returns the binary data as a Buffer.
     */
    async getMessageContent(messageId: string): Promise<Buffer> {
        try {
            this.logger.log(`Fetching content for message: ${messageId}`);

            const response = await this.blobClient.getMessageContent(messageId);

            // The response is a ReadableStream/Readable. We need to convert it to a Buffer.
            return new Promise((resolve, reject) => {
                const chunks: any[] = [];
                response.on('data', (chunk) => chunks.push(chunk));
                response.on('end', () => resolve(Buffer.concat(chunks)));
                response.on('error', (err) => reject(err));
            });
        } catch (error) {
            this.logger.error(`Failed to fetch message content: ${error.message}`);
            throw error;
        }
    }
}
