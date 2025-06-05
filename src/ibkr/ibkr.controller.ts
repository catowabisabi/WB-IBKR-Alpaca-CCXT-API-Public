import { Controller, Post, Body, Get, Query, HttpException, Param, HttpStatus, HttpCode,Delete, Req, Res} from '@nestjs/common';
import { IbkrService } from './ibkr.service';
import { BarSizeSetting, Contract, Order, OrderAction, OrderType, SecType, WhatToShow } from '@stoqey/ib';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateClosePositionDto } from './dto/create-close-position.dto';
import { ExecutionFilter, ExecutionDetail, MarketDataType } from '@stoqey/ib';
import { CommissionReport } from '@stoqey/ib';
import { TagValue } from '@stoqey/ib';
import { Response } from 'express';


@Controller('ibkr')
export class IbkrController {
  constructor(private readonly ibkrService: IbkrService) { }

 /*  @Get('test-connection')
  async testConnection() {
    return this.ibkrService.testConnection();
  }

  @Post('authenticate')
  authenticate(@Body('password') trading_password: string, userEmail: string) {
    return this.ibkrService.authenticate(trading_password, userEmail);
  }

  @Get('/account-summary')
  getAccountSummary(@Query('group') group: string, @Query('tags') tags: string) {
    return this.ibkrService.getAccountSummary(group, tags);
  }


  @Post('cancel-account-summary/:reqId')
  @HttpCode(HttpStatus.OK)
  async cancelAccountSummary(@Param('reqId') reqId: string) {
    await this.ibkrService.cancelAccountSummary(+reqId);
    return { message: 'Account summary subscription cancelled successfully' };

  }




  @Get('positions')
  getPositions() {
    return this.ibkrService.getPositions();
  }



  @Get('pnl')
  getPnL(@Query('account') account: string, @Query('modelCode') modelCode?: string) {
    return this.ibkrService.getPnL(modelCode = "");
  }

  @Get('pnl/:contractId')
  getPnLForPosition(
    @Query('account') account: string,
    @Query('modelCode') modelCode: string,
    @Param('contractId') contractId: number
  ) {
    return this.ibkrService.getPnLSingle(modelCode, contractId);
  }


  @Post('place_order')
  async placeOrder(@Body() createOrderDto: CreateOrderDto) {

    try {
      const msg = await this.ibkrService.placeOrder(createOrderDto);
      return { message: msg };
    } catch (error) {
      throw new HttpException('Failed to place order: ' + error.message, HttpStatus.BAD_REQUEST);
    }
  }



  @Post('cancel-all-orders')
  cancelAllOrders() {
    return this.ibkrService.cancelAllOrders();
  } */
  

 /*  @Post('close-position')
  closePosition(@Body() createClosePositionDto: CreateClosePositionDto) {
    return this.ibkrService.closePosition(createClosePositionDto);
  } */

  /* @Post('close-position')
  async closePosition(@Body() createClosePositionDto: CreateClosePositionDto, @Res() res: Response) {
    try {
      await this.ibkrService.closePosition(createClosePositionDto);
      res.status(HttpStatus.OK).send({ message: 'Position closed successfully' });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Get('calculate-stock-purchase')
  calculateStockPurchase(
    @Query('totalCash') totalCash: number,
    @Query('percentage') percentage: number,
    @Query('pricePerStock') pricePerStock: number
  ) {
    return this.ibkrService.calculateStockPurchase(totalCash, percentage, pricePerStock);
  }

  @Post('execution-details')
  async getExecutionDetails(@Body() filter: ExecutionFilter): Promise<ExecutionDetail[]> {
    return this.ibkrService.getExecutionDetails(filter);
  }

  @Post('commission-reports')
  async getCommissionReport(@Body() filter: ExecutionFilter): Promise<CommissionReport[]> {
    return this.ibkrService.getCommissionReport(filter);
  }

  @Post('market-data-type')
  reqMarketDataType(@Body() marketDataType: MarketDataType): void {
    this.ibkrService.reqMarketDataType(marketDataType);
  }

  @Post('subscribe-market-data/:reqId')
  subscribeToMarketData(
    @Param('reqId') reqId: number, 
    @Body('contract') contract: Contract, 
    @Body('genericTickList') genericTickList: string, 
    @Body('snapshot') snapshot: boolean, 
    @Body('regulatorySnapshot') regulatorySnapshot: boolean, 
    @Body('mktDataOptions') mktDataOptions?: TagValue[]
  ): void {
    this.ibkrService.subscribeToMarketData(reqId, contract, genericTickList, snapshot, regulatorySnapshot, mktDataOptions);
  }

  @Post('subscribe-historical-data/:reqId')
  subscribeToHistoricalData(
    @Param('reqId') reqId: number, 
    @Body('contract') contract: Contract,  
    @Body('endDateTime') endDateTime: string, 
    @Body('durationStr') durationStr: string, 
    @Body('barSizeSetting') barSizeSetting: BarSizeSetting, 
    @Body('whatToShow') whatToShow: WhatToShow, 
    @Body('useRTH') useRTH: number, 
    @Body('formatDate') formatDate: number, 
    @Body('keepUpToDate') keepUpToDate?: boolean, 
    @Body('chartOptions') chartOptions?: TagValue[]
  ): void {
    this.ibkrService.subscribeToHistoricalData(reqId, contract, endDateTime, durationStr, barSizeSetting, whatToShow, useRTH, formatDate, keepUpToDate);
  }

  @Get('contract-details/:symbol')
  async getContractDetails(@Param('symbol') symbol: string,){
    const contractDetails = await this.ibkrService.getContractDetails(symbol);
    return contractDetails
  }

  @Get('latest-price/:symbol')
  async getLatestPrice(@Param('symbol') symbol: string,){
    const latestPrice = await this.ibkrService.getLatestPrice(symbol);
    return latestPrice
}


  @Get('open-orders/:symbol')
    async checkOpenOrder(@Param('symbol') symbol: string) {
      return await this.ibkrService.checkOpenOrder(symbol);
    }



  @Get('open-orders')
    async checkAllOpenOrders() {
      return await this.ibkrService.getOpenOrders();
    }

  


  @Post('cancel-pending-orders/:symbol')
  async cancelOneSymbolPendingOrders(@Param('symbol') symbol: string) {
    return await this.ibkrService.cancelOneSymbolPendingOrders(symbol);
  }
  @Post('cancel-order/:orderId')
  async cancelOneOrder(@Param('orderId') orderId: number) {
    return await this.ibkrService.cancelOneOrder(orderId);
  }

  @Get('positions/:symbol')
  async checkPosition(@Param('symbol') symbol: string) {
    return await this.ibkrService.checkPosition(symbol);
  } */

  /* @Post('close-position/:symbol')
  async closeOnePosition(@Param('symbol') symbol: string) {
    return await this.ibkrService.closeOnePosition(symbol);
  } */

 /*  @Post('close-position/:symbol')
  async closeOnePosition(@Param('symbol') symbol: string, @Res() res: Response) {
    try {
      const result = await this.ibkrService.closeOnePosition(symbol);
      if (result) {
        res.status(HttpStatus.OK).json({ message: 'Position closed successfully', details: result });
      } else {
        res.status(HttpStatus.NOT_FOUND).json({ message: 'No position found for the given symbol' });
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }


  

  @Get('user-info')
 // @UseGuards(JwtAuthGuard)
  async getUserInfo() {
    const reqId = Math.floor(Math.random() * 1000000);
    console.log (`getUserInfo reqId: ${reqId}`)  // 生成一个随机的请求ID
    return this.ibkrService.getAccountId();
  }
  */
}

  



    // console.log('CreateOrderDto (JSON):', JSON.stringify(createOrderDto, null, 2));

    /* 注意事項：
        lmtPrice: 用於限價單，當訂單類型為 OrderType.LMT 時設置。
        auxPrice: 可用於其他需要額外價格點的訂單類型，如停止限價單（OrderType.STP_LMT）等。
        此更新確保當訂單類型為限價單時，使用 lmtPrice；當訂單類型需要如停止價時，則使用 auxPrice。

        在 Postman 中測試
        確保您的 NestJS 應用已運行。
        在 Postman 設置 POST 請求到 http://localhost:3000/orders/place。
        設置 JSON body 並確保使用正確的 orderType：
  
        {
          "symbol": "AAPL",
          "secType": "STK",
          "currency": "USD",
          "exchange": "SMART",
          "action": "BUY",
          "orderType": "LMT",
          "totalQuantity": 1,
          "price": 145.50
        } 

        1. secType (證券類型)
secType 指的是證券的類型。Interactive Brokers 支持多種證券類型，每種類型都有特定的代碼。常見的 secType 包括：

STK - 股票
OPT - 選擇權
FUT - 期貨
IND - 指數
FOP - 期貨選擇權
CASH - 外匯對
CFD - 差價合約
BOND - 債券
CMDTY - 商品
NEWS - 新聞
FUND - 基金
2. currency (貨幣)
currency 代表交易或持有證券時使用的貨幣。Interactive Brokers 支持全球主要的貨幣，常見的包括：

USD - 美元
HKD - 港幣
EUR - 歐元
JPY - 日元
GBP - 英鎊
AUD - 澳元
CAD - 加拿大元
CHF - 瑞士法郎
CNH - 人民幣（離岸）
SEK - 瑞典克朗
NZD - 紐元
3. exchange (交易所)
exchange 是指執行交易的市場或交易所。常見的交易所包括：

SMART - IB智能路由
NYSE - 紐約證券交易所
NASDAQ - 納斯達克
SEHK - 香港交易所
LSE - 倫敦證券交易所
ASX - 澳大利亞證券交易所
CME - 芝加哥商業交易所
CBOT - 芝加哥期貨交易所
HKFE - 香港期貨交易所
4. action (買賣動作)
action 表示訂單的買賣方向。常用的動作包括：

BUY - 買入
SELL - 賣出
SSHORT - 特殊短賣（僅限機構帳戶）
5. orderType (訂單類型)
orderType 指定訂單的類型。Interactive Brokers 支持多種訂單類型，常見的包括：

MKT - 市價單
LMT - 限價單
STP - 停止單
STP LMT - 停止限價單
SLM - 止損市價單
TRAIL - 追蹤止損單
TRAIL LIMIT - 追蹤止損限價單
IOC - 即時或取消
FOK - 全部或無
6. quantity (數量)
quantity 指訂單的數量，其單位取決於證券的類型和市場慣例。例如，股票通常按股計算，期貨則按合約計算。確定您的交易對象以適當設定此值。
        
        */