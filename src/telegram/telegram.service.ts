// src/telegram.service.ts

import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService {
  private bot: TelegramBot;

  constructor() {
    //this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
  }

  init(bot: TelegramBot) {
    this.bot = bot;
  }

  async sendMessage(chatId: string, message: string) {
    await this.bot.sendMessage(chatId, message);
  }

  setBot(bot: TelegramBot) {
    this.bot = bot;
  }
} 