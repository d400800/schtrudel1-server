import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { RequestTrackingService } from './request-tracking.service';

const STILL_WORKING_DELAY_MS = 10_000;
const PLEASE_WAIT_MESSAGE = 'Please wait for your previous request to finish.';
const STILL_WORKING_MESSAGE = 'Still working on it…';
const DEFAULT_ERROR_MESSAGE =
  "Sorry, I couldn't get a response right now. Please try again later.";

export type SendMessageFn = (text: string) => Promise<unknown>;
export type GenerateMessageFn = (text: string) => Promise<string>;

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(
    private requestTracking: RequestTrackingService,
    private aiService: AiService,
  ) {}

  async handleUserText(
    userId: number,
    prompt: string,
    sendMessage: SendMessageFn,
  ): Promise<void> {
    await this.runLongTask(
      userId,
      prompt,
      sendMessage,
      this.aiService.generateText.bind(this.aiService) as GenerateMessageFn,
    ).catch((err: unknown) => {
      this.logger.error(err);
      this.requestTracking.setFree(userId);
    });
  }

  async handleGenerateImage(
    userId: number,
    prompt: string,
    sendMessage: SendMessageFn,
  ) {
    await this.runLongTask(
      userId,
      prompt,
      sendMessage,
      this.aiService.generateImage.bind(this.aiService) as GenerateMessageFn,
    ).catch((err: unknown) => {
      this.logger.error(err);
      this.requestTracking.setFree(userId);
    });
  }

  private async runLongTask(
    userId: number,
    prompt: string,
    sendMessage: SendMessageFn,
    task: GenerateMessageFn,
  ): Promise<void> {
    let stillWorkingTimeoutId: ReturnType<typeof setTimeout> | null = null;

    stillWorkingTimeoutId = setTimeout(() => {
      void sendMessage(STILL_WORKING_MESSAGE);
    }, STILL_WORKING_DELAY_MS);

    try {
      const reply = (await task(prompt)) ?? '...';

      await sendMessage(reply);
    } catch (err: unknown) {
      this.logger.error(err);
      await sendMessage(DEFAULT_ERROR_MESSAGE);
    } finally {
      if (stillWorkingTimeoutId !== null) {
        clearTimeout(stillWorkingTimeoutId);
      }
      this.requestTracking.setFree(userId);
    }
  }
}
