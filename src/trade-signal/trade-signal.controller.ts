import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { TradeSignalService } from './trade-signal.service';
import { CreateTradeSignalDto } from './dto/create-trade-signal.dto';
import { UpdateTradeSignalDto } from './dto/update-trade-signal.dto';
import { plainToInstance } from 'class-transformer';
import { ValidationPipe, UsePipes } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto'; 
import { AdminApiKeyGuard } from 'src/guards/app-api-key.guard';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiSecurity, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Trade Signal')
@ApiSecurity('X-API-Key')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminApiKeyGuard)
@Controller('trade-signal')
export class TradeSignalController {
  constructor(private readonly tradeSignalService: TradeSignalService) { }

  
  @Post('tradingview-signal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle TradingView signal for general trading', description: 'Receives a signal from TradingView and processes it. The first argument `userIdOrEmail` is expected to be part of the request body or otherwise made available to the method. The `createTradeSignalDto` represents the signal payload. Note: The method signature `(@Body() userIdOrEmail:string, createTradeSignalDto: any)` is unconventional; typically the entire body is mapped to a single DTO. For documentation, assuming a body structure that accommodates both.' })
  @ApiBody({
    description: 'Payload for TradingView signal. It should include user identifier and the signal data.',
    schema: {
      type: 'object',
      properties: {
        userIdOrEmail: { type: 'string', example: 'user@example.com' },
        signalPayload: { type: 'object', example: { /* structure of createTradeSignalDto */ symbol: 'BTC/USDT', action: 'buy' } }
      },
      required: ['userIdOrEmail', 'signalPayload']
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Signal received and processed.' /* Define a more specific response DTO if possible */ })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid signal data.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'API Key is missing or invalid.' })
  handleTrade(@Body() body: { userIdOrEmail: string, signalPayload: any }) {
    console.log('TradingView Signal Recieved!')
    return this.tradeSignalService.handleTrade(body.userIdOrEmail, body.signalPayload)
  }

  @Post('tradingview-signal-ib')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle TradingView signal for Interactive Brokers', description: 'Receives a signal from TradingView specifically for Interactive Brokers integration.' })
  @ApiBody({ description: 'TradingView signal payload for IB.', schema: { type: 'object', example: { '帳戶': 'DU12345', '股票': 'AAPL', '交易動作': 'BUY' } } })
  @ApiResponse({ status: HttpStatus.OK, description: 'IB signal received and processed.' /* Define a more specific response DTO */ })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid signal data.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'API Key is missing or invalid.' })
  handleTradeIB(@Body()  tradingviewSignal: any) {
    console.log('TradingView Signal Recieved!')
    return this.tradeSignalService.handleTradeIB(tradingviewSignal)
  }


  @Post('testsignal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test signal endpoint', description: 'Receives a raw signal, reorganizes it into CreateTradeSignalDto, and processes it. Used for testing signal handling.' })
  @ApiBody({
    description: 'Raw signal data for testing. Structure includes account, auth, strategy, order, and positionState details.',
    schema: {
      type: 'object',
      example: {
        '機器人': 'TestBot',
        '帳戶': 'TestAccount',
        '交易所': 'TestExchange',
        aid: 'testAid',
        api_sec: 'testApiSec',
        '策略': 'TestStrategy',
        '注解': 'Test annotation',
        '週期': '1D',
        '股票': 'TEST/USDT',
        '每注': 1000,
        '倍數': 1,
        td_mode: 'isolated',
        ord_type: 'limit',
        sltp_type: 'market',
        '時間1': '2023-01-01T10:00:00Z',
        '交易入場出場價': 50000,
        '交易合約量': 0.02,
        '交易動作': 'BUY',
        '當前倉位狀態': 'FLAT',
        '當前倉位價格': 0,
        '之前倉位狀態': 'FLAT',
        '之前倉位價格': 0
      }
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Test signal processed successfully.', schema: { type: 'object', properties: { message: {type: 'string'}, data: { $ref: '#/components/schemas/CreateTradeSignalDto'} } } })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid test signal data.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'API Key is missing or invalid.' })
  returnSignal(@Body() createTradeSignalDto: any) {
    console.log('TradingView Signal Recieved!')

    const reorganizedData = {
      account: {
        tradingRobot: createTradeSignalDto['機器人'],
        account: createTradeSignalDto['帳戶'],
        exchange: createTradeSignalDto['交易所'],
      },
      auth: {
        AID: createTradeSignalDto.aid,
        apiSec: createTradeSignalDto.api_sec,
      },
      strategy: {
        strategy: createTradeSignalDto['策略'],
        strategyInfo: createTradeSignalDto['注解'],
        strategyTimeFrame: createTradeSignalDto['週期'],
      },
      order: {
        symbol: createTradeSignalDto['股票'],
        usdPerTrade: createTradeSignalDto['每注'],
        margin: createTradeSignalDto['倍數'],
        TdMode: createTradeSignalDto.td_mode,
        OrderType: createTradeSignalDto.ord_type,
        stopLossTakePorfitType: createTradeSignalDto.sltp_type,
        placeOrderTime: createTradeSignalDto['時間1'] || createTradeSignalDto['時間2'],
        triggerPrice: createTradeSignalDto['交易入場出場價'],
        numberOfContract: createTradeSignalDto['交易合約量'],
        tradeAction: createTradeSignalDto['交易動作'],
      },
      positionState: {
        positionNow: createTradeSignalDto['當前倉位狀態'],
        priceOfPositionNow: createTradeSignalDto['當前倉位價格'],
        positiionBefore: createTradeSignalDto['之前倉位狀態'],
        priceOfPositionBefore: createTradeSignalDto['之前倉位價格'],
      },
    };

    const tradeSignalDtoInstance = plainToInstance(CreateTradeSignalDto, reorganizedData, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true
    });

    return this.tradeSignalService.create(tradeSignalDtoInstance);
  }
}
