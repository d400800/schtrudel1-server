import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IngesterService } from './ingester.service';

@Injectable()
export class ChannelIngestListener {
  constructor(private readonly ingesterService: IngesterService) {}

  @OnEvent('channel.add')
  handleChannelAdd(payload: { channelInput: string }): void {
    this.ingesterService.processChannel(payload.channelInput);
  }
}
