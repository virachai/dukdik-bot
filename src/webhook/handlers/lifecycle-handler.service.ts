import { Injectable, Logger } from '@nestjs/common';
import { FollowEvent, UnfollowEvent } from '@line/bot-sdk';
import { GoogleFormsService } from '../../external/google-forms.service';

@Injectable()
export class LifecycleHandlerService {
    private readonly logger = new Logger(LifecycleHandlerService.name);

    constructor(private readonly googleFormsService: GoogleFormsService) { }

    async handleFollow(event: FollowEvent): Promise<void> {
        this.logger.log(`User followed: ${event.source.userId}`);
    }

    async handleUnfollow(event: UnfollowEvent): Promise<void> {
        this.logger.log(`User unfollowed: ${event.source.userId}`);
    }
}
