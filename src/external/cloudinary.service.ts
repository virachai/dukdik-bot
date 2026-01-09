import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { nanoid } from 'nanoid';
import { Buffer } from 'buffer';

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    constructor(private readonly configService: ConfigService) {
        const cloudinaryUrl = this.configService.get<string>('CLOUDINARY_URL');
        if (cloudinaryUrl) {
            cloudinary.config({
                cloudinary_url: cloudinaryUrl,
            });
        } else {
            this.logger.warn('CLOUDINARY_URL not found in environment variables');
        }
    }

    /**
     * Uploads a buffer to Cloudinary using upload_stream.
     */
    async uploadBuffer(buffer: Buffer, folder: string = 'dukdik/images'): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    public_id: `img_${nanoid(15)}`,
                    allowed_formats: ['jpeg', 'png', 'jpg'],
                },
                (error, result) => {
                    if (error) {
                        this.logger.error(`Cloudinary upload failed: ${error.message}`);
                        return reject(error);
                    }
                    if (!result) {
                        return reject(new Error('Cloudinary upload returned empty result'));
                    }
                    this.logger.log(`Cloudinary upload successful: ${result.secure_url}`);
                    resolve(result);
                },
            );

            // Write the buffer to the stream
            uploadStream.end(buffer);
        });
    }
}
