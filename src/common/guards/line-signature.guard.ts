import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class LineSignatureGuard implements CanActivate {
    private readonly channelSecret: string;

    constructor(private readonly configService: ConfigService) {
        this.channelSecret = this.configService.get<string>('LINE_CHANNEL_SECRET') || '';
    }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const signature = request.headers['x-line-signature'];

        if (!signature) {
            throw new UnauthorizedException('Missing signature');
        }

        // rawBody is available if NestFactory.create(AppModule, { rawBody: true }) is used
        const body = request.rawBody;
        if (!body) {
            throw new UnauthorizedException('Raw body not found. Ensure rawBody is enabled in main.ts');
        }

        const hash = crypto
            .createHmac('sha256', this.channelSecret)
            .update(body)
            .digest('base64');

        if (hash !== signature) {
            throw new UnauthorizedException('Invalid signature');
        }

        return true;
    }
}
