import { Injectable, Logger } from '@nestjs/common';
import { MessageEvent } from '@line/bot-sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleFormsService } from '../../external/google-forms.service';
import { LineApiService } from '../../external/line-api.service';
import { CloudinaryService } from '../../external/cloudinary.service';
import { MediaAsset } from '../../database/entities/media-asset.entity';
import { JobRecord } from '../../database/entities/job-record.entity';

@Injectable()
export class MessageHandlerService {
    private readonly logger = new Logger(MessageHandlerService.name);

    constructor(
        private readonly googleFormsService: GoogleFormsService,
        private readonly lineApiService: LineApiService,
        private readonly cloudinaryService: CloudinaryService,
        @InjectRepository(MediaAsset)
        private readonly assetRepository: Repository<MediaAsset>,
        @InjectRepository(JobRecord)
        private readonly jobRepository: Repository<JobRecord>,
    ) { }

    async handle(event: MessageEvent): Promise<void> {
        this.logger.log(`Handling message event (type: ${event.message.type}) from user: ${event.source.userId}`);

        if (event.message.type === 'text') {
            const text = event.message.text;
            this.logger.log(`Received text: ${text}`);

            // Handle job selection
            const jobTypes = ['งานที่ 1', 'งานที่ 2', 'งานที่ 3'];
            if (jobTypes.includes(text)) {
                // Save Job to DB
                try {
                    const job = this.jobRepository.create({
                        lineUserId: event.source.userId,
                        jobType: text,
                        status: 'processing'
                    });
                    await this.jobRepository.save(job);
                    this.logger.log(`Job ${text} saved for user ${event.source.userId}`);
                } catch (error) {
                    this.logger.error(`Failed to save job to DB: ${error.message}`);
                }

                await this.lineApiService.replyMessage(event.replyToken, [
                    {
                        type: 'text',
                        text: 'กำลัง process...',
                    },
                ]);
            }
        }

        if (event.message.type === 'image') {
            try {
                // 1. Fetch binary data from LINE
                const imageBuffer = await this.lineApiService.getMessageContent(event.message.id);
                this.logger.log(`Image content fetched. Size: ${imageBuffer.length} bytes`);

                // 2. Upload to Cloudinary
                const uploadResult = await this.cloudinaryService.uploadBuffer(imageBuffer);
                this.logger.log(`Image uploaded to Cloudinary: ${uploadResult.secure_url}`);

                // 3. Save to Postgres
                try {
                    const asset = this.assetRepository.create({
                        lineUserId: event.source.userId,
                        lineMessageId: event.message.id,
                        type: 'image',
                        cloudinaryUrl: uploadResult.secure_url,
                        cloudinaryPublicId: uploadResult.public_id,
                        metadata: {
                            size: imageBuffer.length,
                            format: uploadResult.format,
                            width: uploadResult.width,
                            height: uploadResult.height
                        }
                    });
                    await this.assetRepository.save(asset);
                    this.logger.log('Image asset saved to Postgres');
                } catch (error) {
                    this.logger.error(`Failed to save asset to Postgres: ${error.message}`);
                }

                // 4. Submit to Google Sheets (legacy)
                await this.googleFormsService.submitData({
                    type: 'cloudinary_upload_success',
                    lineMessageId: event.message.id,
                    userId: event.source.userId,
                    receivedAt: new Date().toISOString(),
                    cloudinaryResponse: uploadResult,
                });

                // 5. Reply with Stickers + Menu
                await this.lineApiService.replyMessage(event.replyToken, [
                    { type: 'sticker', packageId: '446', stickerId: '1988' },
                    { type: 'sticker', packageId: '446', stickerId: '1989' },
                    { type: 'sticker', packageId: '446', stickerId: '1990' },
                    {
                        type: 'text',
                        text: 'ได้รับรูปภาพแล้วครับ ผมส่งสติกเกอร์ตัวแทนงาน 1, 2 และ 3 ให้แล้ว โปรดเลือกงานที่ต้องการดำเนินการ:',
                        quickReply: {
                            items: [
                                {
                                    type: 'action',
                                    action: { type: 'message', label: 'งานที่ 1', text: 'งานที่ 1' },
                                },
                                {
                                    type: 'action',
                                    action: { type: 'message', label: 'งานที่ 2', text: 'งานที่ 2' },
                                },
                                {
                                    type: 'action',
                                    action: { type: 'message', label: 'งานที่ 3', text: 'งานที่ 3' },
                                },
                            ],
                        },
                    },
                ]);

            } catch (error) {
                this.logger.error(`Error processing image message: ${error.message}`);
                await this.lineApiService.replyMessage(event.replyToken, [
                    {
                        type: 'text',
                        text: 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ กรุณาลองใหม่อีกครั้ง',
                    },
                ]);
            }
        }
    }
}
