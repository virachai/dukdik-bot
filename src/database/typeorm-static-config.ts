import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { WebhookEvent } from './entities/webhook-event.entity';
import { MediaAsset } from './entities/media-asset.entity';
import { JobRecord } from './entities/job-record.entity';

config();

export default new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [WebhookEvent, MediaAsset, JobRecord],
    migrations: ['src/database/migrations/*.ts'],
    ssl: {
        rejectUnauthorized: false,
    },
});
