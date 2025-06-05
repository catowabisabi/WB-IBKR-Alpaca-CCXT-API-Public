import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import * as TelegramBot from 'node-telegram-bot-api';

@Module({
  controllers: [TelegramController],
  providers: [
    TelegramService,
    {
      provide: 'TELEGRAM_BOT',
      useFactory: () => {
        //return new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
          console.log(process.env.TELEGRAM_BOT_TOKEN)

        return new TelegramBot('6912758733:AAFLxfTd4oYcvsV5tfkQ9_tHiP16yUmTuEY', {
          polling: true,
        });
      },
    },
  ],
  exports: [TelegramService],
})
export class TelegramModule implements OnModuleInit {
  constructor(
    private telegramService: TelegramService,
    @Inject('TELEGRAM_BOT') private bot: TelegramBot,
  ) {}

  onModuleInit() {
    this.telegramService.init(this.bot);
  }
}