import { Module } from '@nestjs/common';
import { ChannelIngestListener } from './channel-ingest.listener';
import { IngesterService } from './ingester.service';

@Module({
  providers: [IngesterService, ChannelIngestListener],
  exports: [IngesterService],
})
export class IngesterModule {}
