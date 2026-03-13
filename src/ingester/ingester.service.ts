import { Injectable } from '@nestjs/common';

@Injectable()
export class IngesterService {
  processChannel(channelInput: string): void {
    console.log(channelInput);
  }
}
