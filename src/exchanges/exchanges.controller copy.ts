/* import { Controller, Get, Post, Body, Param, NotFoundException, Query, Delete } from '@nestjs/common';
import { ExchangesService } from './exchanges.service'; @Controller('exchanges')
export class ExchangesController2 {
  constructor(private readonly exchangesService: ExchangesService) { }
  @Get(':exchangeName/markets')
  async fetchMarkets(@Param('exchangeName') exchangeName: string) { return await this.exchangesService.fetchMarkets(exchangeName); }

  @Get(':exchangeName/ticker/:base-:quote')
  async getTicker(
    @Param('exchangeName') exchangeName: string,
    @Param('base') base: string, 
    @Param('quote') quote: string,
  ) 
    { 
      const symbol = `${base.toUpperCase()}/${quote.toUpperCase()}`; 
      return await this.exchangesService.fetchTicker(exchangeName.toUpperCase(), symbol); 
    }

  @Get(':exchangeName/symbols')
  async getSymbols(@Param('exchangeName') exchangeName: string) {
    try { return await this.exchangesService.listSymbols(exchangeName); }
    catch (error) { throw new NotFoundException(`Symbols not found for exchange ${exchangeName}`); }
  }

  @Get(':exchangeName/orderbook/:symbol') async getOrderBook(@Param('exchangeName') exchangeName: string, @Param('symbol') symbol: string, @Query('limit') limit: number = 100,
    // 可以指定訂單簿的深度 
  ) { return await this.exchangesService.getOrderBook(exchangeName, symbol, limit); } @Post(':exchangeName/trade/:symbol') async createTrade(@Param('exchangeName') exchangeName: string, @Param('symbol') symbol: string, @Body() tradeParams: { type: string; amount: number; price?: number },) { return await this.exchangesService.createTrade(exchangeName, symbol, tradeParams); } @Get(':exchangeName/trade-history/:symbol') async getTradeHistory(@Param('exchangeName') exchangeName: string, @Param('symbol') symbol: string,) { return await this.exchangesService.getTradeHistory(exchangeName, symbol); } @Get(':exchangeName/balance') async getBalance(@Param('exchangeName') exchangeName: string,) { return await this.exchangesService.getBalance(exchangeName); } @Post(':exchangeName/order') async placeOrder(@Param('exchangeName') exchangeName: string, @Body() orderParams: { symbol: string; type: string; side: string; amount: number; price?: number },) { return await this.exchangesService.placeOrder(exchangeName, orderParams); } @Delete(':exchangeName/order/:id') async cancelOrder(@Param('exchangeName') exchangeName: string, @Param('id') id: string,) { return await this.exchangesService.cancelOrder(exchangeName, id); }
  // 可以添加更多路由... 
} */