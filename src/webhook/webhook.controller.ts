import { Controller, Post, Body } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { SignalDto } from './dto/create-signal.dto';
import { MongoDBSignalDto } from './dto/mongodb-signal.dto';
import { TelegramService } from 'src/telegram/telegram.service';
import { ApiOperation, ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Webhook')
@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly tgbot: TelegramService
  ) { }

  @Post('signal')
  @ApiOperation({ summary: '接收交易信號', description: '接收並處理交易信號' })
  @ApiBody({ type: SignalDto })
  @ApiResponse({ status: 200, description: '信號處理成功', type: SignalDto })
  async handleSignal(@Body() signalDto: SignalDto) {
    // Transform SignalDto into MongoDBSignalDto
    const modifiedSignal = new MongoDBSignalDto({
      account: {
        account: signalDto.帳戶,
        password: signalDto.密碼
      },
      strategy: {
        strategy: signalDto.策略,
        strategyTimeFrame: signalDto.週期
      },
      order: {
        symbol: signalDto.股票,
        type: signalDto.類別,
        currency: signalDto.單位,
        usdPerTrade: signalDto.每注,
        margin: signalDto.倍數,
        exchange: signalDto.交易所,
        placeOrderTime: new Date(signalDto.時間),
        tradeAction: signalDto.交易動作,
        numberOfContract: signalDto.交易股數,
        triggerPrice: parseFloat(signalDto.價格),
        setupOrderType: signalDto.建倉類型,
        closePositionType: signalDto.平倉類型
      }
    });
    
    // Call handleSendSignal with all required parameters
    return this.webhookService.handleSendSignal(
      signalDto,
      "newSignal",
      modifiedSignal,
      {} // Empty replyingData object
    );
  }

  @Post()//收到Signal TradingView
  @ApiOperation({
    summary: '接收 TradingView 發送的 Webhook Signal',
    description: '此端點用於接收 TradingView webhook 傳送的交易信號，並根據 signal 資料執行儲存與通知操作。',
  })
  @ApiBody({
    type: SignalDto,
    description: 'TradingView 傳送的 webhook 資料格式',
  })
  @ApiResponse({
    status: 200,
    description: '成功處理 webhook 並儲存至資料庫或返回訊息',
    schema: {
      oneOf: [
        {
          example: {
            status: 'ok',
            data: {
              帳戶: '我的名字@gmail.com',
              商品: 'TSLA',
              動作: '買入',
              時間: '2025-06-04T01:00:00.000Z',
              策略名稱: '突破策略'
            },
          },
        },
        {
          example: {
            status: 'ok',
            data: {
              message: '格式不符或信號未被處理',
            },
          },
        },
      ],
    },
  })
  async handleWebHookSignal(@Body() signal: SignalDto): Promise<{ status: string; data: MongoDBSignalDto } | { status: string; data: { message: string } }> {

    let msg = "未有格式內容"

    if (signal.帳戶 === "我的名字@gmail.com") {
      msg = `
.\n\n\n\n\n\n\n\n\n\n\n\n
時間: ${new Date()}\n

接收到新的Webhook: 
${JSON.stringify(signal, null, 2)}
`;
    }


    console.log(`\n\n${"=".repeat(30)}`);
    console.log(`\n接收到新的Webhook. ${signal.帳戶}\n\n`);
    this.tgbot.sendMessage(process.env.TG_ID_CAT, msg);
    return this.webhookService.handleWebHookSignal(signal);
  }
}
