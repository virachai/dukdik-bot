import { Injectable, Logger } from '@nestjs/common';
import { MessageEvent } from '@line/bot-sdk';
import { GoogleFormsService } from '../../external/google-forms.service';
import { LineApiService } from '../../external/line-api.service';
import { CloudinaryService } from '../../external/cloudinary.service';

@Injectable()
export class MessageHandlerService {
    private readonly logger = new Logger(MessageHandlerService.name);

    constructor(
        private readonly googleFormsService: GoogleFormsService,
        private readonly lineApiService: LineApiService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    async handle(event: MessageEvent): Promise<void> {
        this.logger.log(`Handling message event (type: ${event.message.type}) from user: ${event.source.userId}`);

        if (event.message.type === 'text') {
            const text = event.message.text;
            this.logger.log(`Received text: ${text}`);
        }

        if (event.message.type === 'image') {
            try {
                // 1. Fetch binary data from LINE
                const imageBuffer = await this.lineApiService.getMessageContent(event.message.id);
                this.logger.log(`Image content fetched. Size: ${imageBuffer.length} bytes`);

                // 2. Upload to Cloudinary
                const uploadResult = await this.cloudinaryService.uploadBuffer(imageBuffer);
                this.logger.log(`Image uploaded to Cloudinary: ${uploadResult.secure_url}`);

                // 3. Submit metadata and URL to Google Sheets
                await this.googleFormsService.submitData({
                    type: 'image_data',
                    messageId: event.message.id,
                    cloudinaryUrl: uploadResult.secure_url,
                    dataSize: `${imageBuffer.length} bytes`,
                    userId: event.source.userId,
                    receivedAt: new Date().toISOString()
                });

            } catch (error) {
                this.logger.error(`Error processing image message: ${error.message}`);
            }
        }
    }
}
