import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WebhookController } from './line-webhook.controller';
import { WebhookService } from './webhook.service';
import { MessageHandlerService } from './handlers/message-handler.service';
import { PostbackHandlerService } from './handlers/postback-handler.service';
import { LifecycleHandlerService } from './handlers/lifecycle-handler.service';
import { GoogleFormsService } from '../external/google-forms.service';
import { LineApiService } from '../external/line-api.service';
import { CloudinaryService } from '../external/cloudinary.service';

@Module({
    imports: [
        HttpModule,
        ConfigModule,
    ],
    controllers: [WebhookController],
    providers: [
        WebhookService,
        MessageHandlerService,
        PostbackHandlerService,
        LifecycleHandlerService,
        GoogleFormsService,
        LineApiService,
        CloudinaryService,
    ],
})
export class WebhookModule { }
