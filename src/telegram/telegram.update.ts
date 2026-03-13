import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Action,
  Command,
  Ctx,
  Next,
  On,
  Start,
  Update,
  Use,
} from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { AuthService } from '../auth/auth.service';
import { BotService } from '../bot/bot.service';
import { RequestTrackingService } from '../bot/request-tracking.service';

export const CHANNEL_ADD_PROMPT =
  'Type-in the channel (channel id, @handle, url)';

interface ActionCtx extends Context {
  match: RegExpMatchArray;
}

@Update()
export class TelegramUpdate {
  constructor(
    private readonly authService: AuthService,
    private readonly botService: BotService,
    private readonly requestTracking: RequestTrackingService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Use()
  async authMiddleware(
    @Ctx() ctx: Context,
    @Next() next: () => Promise<void>,
  ): Promise<void> {
    const userId = ctx.from?.id;

    if (userId === undefined) {
      await ctx.reply('Unauthorized');

      return;
    }

    const allowed = await this.authService.isUserAllowed(userId);

    if (!allowed) {
      await ctx.reply('Unauthorized');

      return;
    }

    await next();
  }

  @Use()
  async busyCheckMiddleware(
    @Ctx() ctx: Context,
    @Next() next: () => Promise<void>,
  ): Promise<void> {
    const userId = ctx.from?.id;

    if (userId === undefined) {
      return next();
    }

    if (this.requestTracking.isBusy(userId)) {
      await ctx.reply('Please wait for the current request to finish.');

      return;
    }
    await next();
  }

  @Start()
  async onStart(@Ctx() ctx: Context): Promise<void> {
    await ctx.reply('Select action:', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Add channel', callback_data: 'add_channel' },
            { text: 'Display channels', callback_data: 'my_channels' },
            { text: 'Create recipe', callback_data: 'create_recipe' },
          ],
        ],
      },
    });
  }

  @Command('help')
  async onHelp(@Ctx() ctx: Context): Promise<void> {
    await ctx.reply(
      'Commands: /start, /help. Send any message for an AI reply.',
    );
  }

  @Command(['add_channel'])
  async onAddChannel(@Ctx() ctx: Context): Promise<void> {
    await ctx.reply(CHANNEL_ADD_PROMPT, {
      reply_markup: {
        force_reply: true,
      },
    });
  }

  @Action('add_channel')
  async onAddChannelAction(@Ctx() ctx: Context): Promise<void> {
    await ctx.answerCbQuery();
    await ctx.reply(CHANNEL_ADD_PROMPT, {
      reply_markup: {
        force_reply: true,
      },
    });
  }

  // Handle button clicks
  @Action(['orientation_landscape', 'orientation_portrait'])
  async onSelectOrientation(@Ctx() ctx: ActionCtx) {
    const selection = ctx.match[0].split('_')[1]; // "landscape" or "portrait"

    await ctx.answerCbQuery(); // stop loading spinner
    await ctx.reply(`✅ You selected *${selection}* orientation.`, {
      parse_mode: 'Markdown',
    });
  }

  @On('text')
  async onText(@Ctx() ctx: Context): Promise<void> {
    const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';

    if (!text || !ctx.from || !ctx.chat) return;

    const msg = ctx.message;
    const replyText =
      msg &&
      'reply_to_message' in msg &&
      msg.reply_to_message &&
      'text' in msg.reply_to_message
        ? msg.reply_to_message.text
        : undefined;
    if (replyText !== undefined && replyText.includes(CHANNEL_ADD_PROMPT)) {
      await ctx.reply(
        'Your request has been received. A notification will be sent as soon as the channel is processed.',
      );
      this.eventEmitter.emit('channel.add', { channelInput: text });
      return;
    }

    const sendMessage = (msg: string) => ctx.reply(msg);

    if (text.toLowerCase().includes('create')) {
      await this.botService.handleGenerateImage(ctx.from.id, text, sendMessage);
    } else {
      await this.botService.handleUserText(ctx.from.id, text, sendMessage);
    }
  }
}
