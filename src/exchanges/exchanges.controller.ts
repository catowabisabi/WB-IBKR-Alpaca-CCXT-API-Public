import { Controller, Get, Post, Body, Param, NotFoundException, Query, Delete, UseGuards } from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt_auth.guard';


@Controller('exchanges')
export class ExchangesController {
  constructor(
    private readonly exchangesService: ExchangesService
  ) {}

  @Get(':exchangeName/markets')
  async fetchMarkets(@Param('exchangeName') exchangeName: string) {
    return await this.exchangesService.fetchMarkets(exchangeName);
  }

 @Get(':exchangeName/currencies')
  async fetchCurrencies(@Param('exchangeName') exchangeName: string) {
    return await this.exchangesService.fetchCurrencies(exchangeName);
  }

  /* @Get('test-fetch-currencies')
async testFetchCurrencies() {
  await this.exchangesService.testFetchCurrencies();
  return 'Test completed. Check the console for results.';
} */

  @Get(':exchangeName/load-markets')
  async loadMarkets(
    @Param('exchangeName') exchangeName: string,
    @Query('reload') reload: boolean = false,
  ) {
    return await this.exchangesService.loadMarkets(exchangeName, reload);
  }

  

   
  @Get(':exchangeName/orderbook/:base-:quote')
async getOrderBook(
  @Param('exchangeName') exchangeName: string,
  @Param('base') base: string,
  @Param('quote') quote: string,
  @Query('limit') limit?: number,
  @Query('params') params: any = {},
  ) {
    return await this.exchangesService.fetchOrderBook(exchangeName.toUpperCase(), base, quote, limit, params);
  }

 
  @Get(':exchangeName/status')
  async fetchStatus(
    @Param('exchangeName') exchangeName: string,
    @Query('params') params: any = {},
  ) {
    return await this.exchangesService.fetchStatus(exchangeName, params);
  }

  
  @Get(':exchangeName/l2-orderbook/:base-:quote')
  async fetchL2OrderBook(
    @Param('exchangeName') exchangeName: string,
    @Param('base') base: string,
    @Param('quote') quote: string,
    @Query('limit') limit?: number,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.fetchL2OrderBook(exchangeName, base, quote, limit, params);
  }

  @Get(':exchangeName/trades/:base-:quote')
  async fetchTrades(
    @Param('exchangeName') exchangeName: string,
    @Param('base') base: string,
    @Param('quote') quote: string,
    @Query('since') since?: number,
    @Query('limit') limit?: number,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.fetchTrades(exchangeName, base, quote, since, limit, params);
  }

  @Get(':exchangeName/ticker/:base-:quote')
    async fetchTicker(
      @Param('exchangeName') exchangeName: string,
      @Param('base') base: string,
      @Param('quote') quote: string,
    ) {
      return await this.exchangesService.fetchTicker(exchangeName.toUpperCase(), base, quote);
    }

 

  @Get(':exchangeName/balance')
  async fetchBalance(@Param('exchangeName') exchangeName: string) {
    return await this.exchangesService.fetchBalance(exchangeName);
  }

  @Post(':exchangeName/order')
  async createOrder(
    @Param('exchangeName') exchangeName: string,
    @Body() orderParams: {symbol: string; type: string; side: string; amount: number; price?: number; params?: any;
    },
  ) {
    return await this.exchangesService.createOrder(exchangeName, orderParams.symbol, orderParams.type, orderParams.side, orderParams.amount, orderParams.price, orderParams.params);
  }

  @Post(':exchangeName/orders')
  async createOrders(
    @Param('exchangeName') exchangeName: string,
    @Body() ordersParams: {
      orders: {
        symbol: string;
        type: string;
        side: string;
        amount: number;
        price?: number;
        params?: any;
      }[];
      params?: any;
    },
  ) {
    const { orders, params } = ordersParams;
    return await this.exchangesService.createOrders(exchangeName, orders, params);
  }

  @Post(':exchangeName/limit-buy-order')
  async createLimitBuyOrder(
    @Param('exchangeName') exchangeName: string,
    @Body() orderParams: {
      symbol: string;
      amount: number;
      price: number;
      params?: any;
    },
  ) {
    const { symbol, amount, price, params } = orderParams;
    return await this.exchangesService.createLimitBuyOrder(exchangeName, symbol, amount, price, params);
  }

  @Post(':exchangeName/limit-sell-order')
  async createLimitSellOrder(
    @Param('exchangeName') exchangeName: string,
    @Body() orderParams: {
      symbol: string;
      amount: number;
      price: number;
      params?: any;
    },
  ) {
    const { symbol, amount, price, params } = orderParams;
    return await this.exchangesService.createLimitSellOrder(exchangeName, symbol, amount, price, params);
  }

  @Post(':exchangeName/market-buy-order')
  async createMarketBuyOrder(
    @Param('exchangeName') exchangeName: string,
    @Body() orderParams: {
      symbol: string;
      amount: number;
      params?: any;
    },
  ) {
    const { symbol, amount, params } = orderParams;
    return await this.exchangesService.createMarketBuyOrder(exchangeName, symbol, amount, params);
  }

  @Post(':exchangeName/market-sell-order')
  async createMarketSellOrder(
    @Param('exchangeName') exchangeName: string,
    @Body() orderParams: {
      symbol: string;
      amount: number;
      params?: any;
    },
  ) {
    const { symbol, amount, params } = orderParams;
    return await this.exchangesService.createMarketSellOrder(exchangeName, symbol, amount, params);
  }

  @Delete(':exchangeName/order/:id')
  async cancelOrder(
    @Param('exchangeName') exchangeName: string,
    @Param('id') id: string,
    @Query('symbol') symbol?: string,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.cancelOrder(exchangeName, id, symbol, params);
  }

  @Get(':exchangeName/order/:id')
  async fetchOrder(
    @Param('exchangeName') exchangeName: string,
    @Param('id') id: string,
    @Query('symbol') symbol?: string,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.fetchOrder(exchangeName, id, symbol, params);
  }

  @Get(':exchangeName/orders')
  async fetchOrders(
    @Param('exchangeName') exchangeName: string,
    @Query('symbol') symbol?: string,
    @Query('since') since?: number,
    @Query('limit') limit?: number,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.fetchOrders(exchangeName, symbol, since, limit, params);
  }

  @Get(':exchangeName/open-orders')
  async fetchOpenOrders(
    @Param('exchangeName') exchangeName: string,
    @Query('symbol') symbol?: string,
    @Query('since') since?: number,
    @Query('limit') limit?: number,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.fetchOpenOrders(exchangeName, symbol, since, limit, params);
  }

 

  @Get(':exchangeName/closed-orders')
  async fetchClosedOrders(
    @Param('exchangeName') exchangeName: string,
    @Query('symbol') symbol?: string,
    @Query('since') since?: number,
    @Query('limit') limit?: number,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.fetchClosedOrders(exchangeName, symbol, since, limit, params);
  }

  @Get(':exchangeName/my-trades')
  async fetchMyTrades(
    @Param('exchangeName') exchangeName: string,
    @Query('symbol') symbol?: string,
    @Query('since') since?: number,
    @Query('limit') limit?: number,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.fetchMyTrades(exchangeName, symbol, since, limit, params);
  }

  @Get(':exchangeName/open-interest/:base-:quote')
  async fetchOpenInterest(
    @Param('exchangeName') exchangeName: string,
    @Param('base') base: string,
    @Param('quote') quote: string,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.fetchOpenInterest(exchangeName, base, quote, params);
  }



  


  @Get(':exchangeName/liquidations/:base-:quote')
  async fetchLiquidations(
    @Param('exchangeName') exchangeName: string,
    @Param('base') base: string,
    @Param('quote') quote: string,
    @Query('since') since?: number,
    @Query('limit') limit?: number,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.fetchLiquidations(exchangeName, base, quote, since, limit, params);
  }

  @Get(':exchangeName/my-liquidations/:base-:quote')
  async fetchMyLiquidations(
    @Param('exchangeName') exchangeName: string,
    @Param('base') base: string,
    @Param('quote') quote: string,
    @Query('since') since?: number,
    @Query('limit') limit?: number,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.fetchMyLiquidations(exchangeName, base, quote, since, limit, params);
  }

  @Get(':exchangeName/greeks/:base-:quote')
  async fetchGreeks(
    @Param('exchangeName') exchangeName: string,
    @Param('base') base: string,
    @Param('quote') quote: string,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.fetchGreeks(exchangeName, base, quote, params);
  }

  @Get(':exchangeName/cross-borrow-rate/:code')
  async fetchCrossBorrowRate(
    @Param('exchangeName') exchangeName: string,
    @Param('code') code: string,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.fetchCrossBorrowRate(exchangeName, code, params);
  }

  @Get(':exchangeName/cross-borrow-rates')
  async fetchCrossBorrowRates(
    @Param('exchangeName') exchangeName: string,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.fetchCrossBorrowRates(exchangeName, params);
  }

  @Get(':exchangeName/isolated-borrow-rate/:base-:quote')
  async fetchIsolatedBorrowRate(
    @Param('exchangeName') exchangeName: string,
    @Param('base') base: string,
    @Param('quote') quote: string,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.fetchIsolatedBorrowRate(exchangeName, base, quote, params);
  }

  @Get(':exchangeName/isolated-borrow-rates')
  async fetchIsolatedBorrowRates(
    @Param('exchangeName') exchangeName: string,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.fetchIsolatedBorrowRates(exchangeName, params);
  }

  @Get(':exchangeName/option/:base-:quote')
  async fetchOption(
    @Param('exchangeName') exchangeName: string,
    @Param('base') base: string,
    @Param('quote') quote: string,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.fetchOption(exchangeName, base, quote, params);
  }

  @Get(':exchangeName/option-chain/:code')
  async fetchOptionChain(
    @Param('exchangeName') exchangeName: string,
    @Param('code') code: string,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.fetchOptionChain(exchangeName, code, params);
  }

  @Get(':exchangeName/convert-quote/:fromCode-:toCode')
  async fetchConvertQuote(
    @Param('exchangeName') exchangeName: string,
    @Param('fromCode') fromCode: string,
    @Param('toCode') toCode: string,
    @Query('amount') amount: string,
    @Query('params') params?: any,
  ) {
    return await this.exchangesService.fetchConvertQuote(exchangeName, fromCode, toCode, amount, params);
  } 

  @Get(':exchangeName/list-symbols')
  async listSymbols(
    @Param('exchangeName') exchangeName: string,
  ) {
    return await this.exchangesService.listSymbols(exchangeName);
  }
  
}