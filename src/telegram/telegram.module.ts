import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { AuthModule } from '../auth/auth.module';
import { BotModule } from '../bot/bot.module';
import { IngesterModule } from '../ingester/ingester.module';
import { TelegramUpdate } from './telegram.update';

@Module({
  imports: [
    ConfigModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        token: config.get<string>('TELEGRAM_TOKEN') ?? '',
        launchOptions: { dropPendingUpdates: true },
      }),
    }),
    AuthModule,
    BotModule,
    IngesterModule,
  ],
  providers: [TelegramUpdate],
})
export class TelegramModule {}
