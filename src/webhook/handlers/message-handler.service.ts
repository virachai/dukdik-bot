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

            // Handle 'ดึงรูปปัจจุบันกลับมา' request
            if (text === 'ส่งรูปนี้กลับมา') {
                try {
                    const lastAsset = await this.assetRepository.findOne({
                        where: { lineUserId: event.source.userId, type: 'image' },
                        order: { createdAt: 'DESC' }
                    });

                    if (lastAsset && lastAsset.cloudinaryUrl) {
                        await this.lineApiService.replyMessage(event.replyToken, [
                            {
                                type: 'image',
                                originalContentUrl: lastAsset.cloudinaryUrl,
                                previewImageUrl: lastAsset.cloudinaryUrl,
                            },
                        ]);
                    }
                } catch (error) {
                    this.logger.error(`Error fetching current asset: ${error.message}`);
                }
                return;
            }

            // Handle 'ดูรูปก่อนหน้า' request
            if (text === 'ดูรูปก่อนหน้า') {
                try {
                    const previousAssets = await this.assetRepository.find({
                        where: { lineUserId: event.source.userId, type: 'image' },
                        order: { createdAt: 'DESC' },
                        take: 1,
                        skip: 1
                    });

                    if (previousAssets.length > 0 && previousAssets[0].cloudinaryUrl) {
                        const lastAsset = previousAssets[0];
                        await this.lineApiService.replyMessage(event.replyToken, [
                            {
                                type: 'text',
                                text: 'นี่คือรูปภาพล่าสุดที่คุณเคยส่งมาครับ:',
                            },
                            {
                                type: 'image',
                                originalContentUrl: lastAsset.cloudinaryUrl,
                                previewImageUrl: lastAsset.cloudinaryUrl,
                            },
                        ]);
                    } else {
                        await this.lineApiService.replyMessage(event.replyToken, [
                            {
                                type: 'text',
                                text: 'ไม่พบประวัติรูปภาพก่อนหน้านี้ครับ',
                            },
                        ]);
                    }
                } catch (error) {
                    this.logger.error(`Error fetching last asset: ${error.message}`);
                }
                return;
            }

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
                // 1. Fetch, Upload, and Save
                const imageBuffer = await this.lineApiService.getMessageContent(event.message.id);
                const uploadResult = await this.cloudinaryService.uploadBuffer(imageBuffer);

                const asset = this.assetRepository.create({
                    lineUserId: event.source.userId,
                    lineMessageId: event.message.id,
                    type: 'image',
                    cloudinaryUrl: uploadResult.secure_url,
                    cloudinaryPublicId: uploadResult.public_id,
                    metadata: { size: imageBuffer.length, format: uploadResult.format }
                });
                await this.assetRepository.save(asset);

                // 2. Submit to Google Sheets
                await this.googleFormsService.submitData({
                    type: 'cloudinary_upload_success',
                    lineMessageId: event.message.id,
                    cloudinaryUrl: uploadResult.secure_url,
                });

                // 3. Reply Sequence
                await this.lineApiService.replyMessage(event.replyToken, [
                    // M1: Status + Mock AI Description + Quick Reply (Current Image)
                    {
                        type: 'text',
                        text: 'ได้รับรูปภาพเรียบร้อยครับ!\n\n📄 คำอธิบาย: รอ migrate AI',
                        quickReply: {
                            items: [
                                {
                                    type: 'action',
                                    action: { type: 'message', label: '📥 ส่งรูปนี้กลับมา', text: 'ส่งรูปนี้กลับมา' },
                                },
                            ],
                        },
                    },
                    // M2, M3, M4: 3 Stickers
                    { type: 'sticker', packageId: '446', stickerId: '1988' },
                    { type: 'sticker', packageId: '446', stickerId: '1989' },
                    { type: 'sticker', packageId: '446', stickerId: '1990' },
                    // M5: Job Selection Menu + Previous Image
                    {
                        type: 'text',
                        text: 'โปรดเลือกงานที่ต้องการดำเนินการต่อ:',
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
                                {
                                    type: 'action',
                                    action: { type: 'message', label: '🔍 ดูรูปก่อนหน้า', text: 'ดูรูปก่อนหน้า' },
                                },
                            ],
                        },
                    },
                ]);

            } catch (error) {
                this.logger.error(`Error processing image message: ${error.message}`);
                await this.lineApiService.replyMessage(event.replyToken, [
                    { type: 'text', text: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
                ]);
            }
        }
    }
}
