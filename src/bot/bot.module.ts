import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { BotService } from './bot.service';
import { RequestTrackingService } from './request-tracking.service';

@Module({
  imports: [AiModule],
  providers: [BotService, RequestTrackingService],
  exports: [BotService, RequestTrackingService],
})
export class BotModule {}
