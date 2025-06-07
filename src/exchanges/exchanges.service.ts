import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, ServiceUnavailableException, InternalServerErrorException } from '@nestjs/common';
import * as ccxt from 'ccxt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExchangesService {
  private exchanges: { [key: string]: ccxt.Exchange, } = {};

  constructor(private configService: ConfigService) {
    //this.configService.get('BINANCE_API_KEY')
    this.initializeExchanges();
    
}

  private buildSymbol(base: string, quote: string): string {
    console.log(`${base.toUpperCase()}/${quote.toUpperCase()}`)
    return `${base.toUpperCase()}/${quote.toUpperCase()}`;
  }

  private getExchange(exchangeName: string): ccxt.Exchange {
    const exchange = this.exchanges[exchangeName.toLowerCase()];
    if (!exchange) {
      throw new NotFoundException(`Exchange ${exchangeName} not found`);
    }
    exchange.options = {
      adjustForTimeDifference: true,  // 尝试自动调整时间差异
    };
    return exchange;
  }

  private handleCcxtException(error: any, exchangeName: string) {
    if (error instanceof ccxt.NetworkError) {
      throw new ServiceUnavailableException(`Network error on exchange ${exchangeName}: ${error.message}`);
    } else if (error instanceof ccxt.ExchangeError) {
      throw new BadRequestException(`Exchange error on ${exchangeName}: ${error.message}`);
    } else if (error instanceof ccxt.OrderNotFound) {
      throw new NotFoundException(`Order not found on ${exchangeName}: ${error.message}`);
    } else {
      console.error(`An unexpected error occurred on ${exchangeName}: ${error}`);
      throw new InternalServerErrorException(`An unexpected error occurred on ${exchangeName}`);
    }
  }

  private initializeExchanges() {
    const exchangeList: { id: string, class: any }[] = [
        { id: 'binance', class: ccxt.binance },
        //{ id: 'coinbase', class: ccxt.coinbase },
        { id: 'bitget', class: ccxt.bitget },
        { id: 'bybit', class: ccxt.bybit },
        { id: 'kucoin', class: ccxt.kucoin },
        { id: 'mexc', class: ccxt.mexc },
        { id: 'okx', class: ccxt.okx },
        { id: 'deribit', class: ccxt.deribit },
        { id: 'kraken', class: ccxt.kraken },
        { id: 'kucoinfutures', class: ccxt.kucoinfutures },
        // 可以添加更多交易所...
    ];

    exchangeList.forEach(exchange => {
      const apiKey = this.configService.get<string>(`${exchange.id.toUpperCase()}_API_KEY`);
      const secret = this.configService.get<string>(`${exchange.id.toUpperCase()}_SECRET`);
      const options: any = { 'enableRateLimit': true };

      if (apiKey) {options.apiKey = apiKey;}
      if (secret) {options.secret = secret;}
      const timestampOffset = 1100;
      this.exchanges[exchange.id] = new exchange.class({
        apiKey: apiKey,
        secret: secret,
        timeout: 30000,
        enableRateLimit: true,
        nonce: (() => Date.now() - timestampOffset),
        options: {
          adjustForTimeDifference: true,  // Add this line
          ...options, 
        },
      });
  });
}

  async fetchMarkets(exchangeName: string): Promise<ccxt.Market[]> {
    const exchange = this.getExchange(exchangeName);
    const markets = await exchange.loadMarkets();
    console.log( `\n\n\nThe first market of ${exchangeName} is :\n`)
    console.log(Object.values(markets));
    return Object.values(markets);
  }

  async fetchCurrencies(exchangeName: string): Promise<ccxt.Currency[]> {
    const exchange = this.getExchange(exchangeName);
    try {
      const currencies = await exchange.fetchCurrencies();
      console.log(currencies)
      return Object.values(currencies);
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }
/* 
  async testFetchCurrencies() {
    for (const exchangeId of Object.keys(this.exchanges)) {
      console.log(`Fetching currencies for exchange: ${exchangeId}`);
      try {
        const currencies = await this.fetchCurrencies(exchangeId);
        console.log(`Currencies for exchange ${exchangeId}:`);
        console.log(currencies);
      } catch (error) {
        console.error(`Error fetching currencies for exchange ${exchangeId}:`, error);
      }
      console.log('---');
    }
  } */

  async loadMarkets(exchangeName: string, reload = false): Promise<ccxt.Market[]> {
    const exchange = this.getExchange(exchangeName);
    try {
      const markets = await exchange.loadMarkets(reload);
      console.log(Object.values(markets)[0])
      return Object.values(markets);
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }

  async fetchOrderBook(exchangeName: string, base: string, quote: string, limit?: number, params: any = {}): Promise<ccxt.OrderBook> {
    const exchange = this.getExchange(exchangeName);
    const symbol = this.buildSymbol(base, quote);
    try {
      const orderBook = await exchange.fetchOrderBook(symbol, limit, params);
      return orderBook;
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }

  async fetchStatus(exchangeName: string, params: any = {}): Promise<any> {
    const exchange = this.getExchange(exchangeName);
    try {
      const status = await exchange.fetchStatus(params);
      return status;
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  } 

  async fetchL2OrderBook(exchangeName: string, base: string, quote: string, limit?: number, params: any = {}, ): Promise<ccxt.OrderBook> {
    const exchange = this.getExchange(exchangeName);
    const symbol = this.buildSymbol(base, quote);
  
    try {
      const orderBook = await exchange.fetchL2OrderBook(symbol, limit, params);
      return orderBook;
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }

  async fetchTrades(exchangeName: string, base: string, quote: string, since?: number, limit?: number, params?: any): Promise<ccxt.Trade[]> {
    const exchange = this.getExchange(exchangeName);
    const symbol = this.buildSymbol(base, quote);
    try {
      const trades = await exchange.fetchTrades(symbol, since, limit, params);
      return trades;
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }



  async fetchTicker(exchangeName: string, base: string, quote: string): Promise<ccxt.Ticker> {
    const exchange = this.getExchange(exchangeName);
    const symbol = this.buildSymbol(base, quote);
    try {
      const ticker = await exchange.fetchTicker(symbol);
      return ticker;
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }

  async fetchBalance(exchangeName: string): Promise<ccxt.Balances> {
    const exchange = this.getExchange(exchangeName);
    try {
      const balance: ccxt.Balances = await exchange.fetchBalance();
      return balance;
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }

  async createOrder(exchangeName: string, symbol: string, type: string, side: string, amount: number, price?: number, params?: any): Promise<ccxt.Order> {
    const exchange = this.getExchange(exchangeName);
    try {
      const order = await exchange.createOrder(symbol, type, side, amount, price, params);
      return order;
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }

  async createOrders(exchangeName: string, orders: Array<{ symbol: string; type: string; side: string; amount: number; price?: number; params?: any }>, params?: any): Promise<ccxt.Order[]> {
    const exchange = this.getExchange(exchangeName);
    const results = [];
    for (const order of orders) {
      try {
        const result = await exchange.createOrder(order.symbol, order.type, order.side, order.amount, order.price, { ...params, ...order.params });
        results.push(result);
      } catch (error) {
        this.handleCcxtException(error, exchangeName);
      }
    }
    return results;
  }



  async createLimitBuyOrder(exchangeName: string, symbol: string, amount: number, price: number, params?: any): Promise<ccxt.Order> {
    const exchange = this.getExchange(exchangeName);
    try {
      const order = await exchange.createLimitBuyOrder(symbol, amount, price, params);
      return order;
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }

  async createLimitSellOrder(exchangeName: string, symbol: string, amount: number, price: number, params?: any): Promise<ccxt.Order> {
    const exchange = this.getExchange(exchangeName);
    try {
      const order = await exchange.createLimitSellOrder(symbol, amount, price, params);
      return order;
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }

  async createMarketBuyOrder(exchangeName: string, symbol: string, amount: number, params?: any): Promise<ccxt.Order> {
    const exchange = this.getExchange(exchangeName);
    try {
      const order = await exchange.createMarketBuyOrder(symbol, amount, params);
      return order;
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }

  async createMarketSellOrder(exchangeName: string, symbol: string, amount: number, params?: any): Promise<ccxt.Order> {
    const exchange = this.getExchange(exchangeName);
    try {
      const order = await exchange.createMarketSellOrder(symbol, amount, params);
      return order;
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }

  async cancelOrder(exchangeName: string, id: string, symbol?: string, params?: any): Promise<Partial<ccxt.Order>> {
    const exchange = this.getExchange(exchangeName);
    try {
      const result = await exchange.cancelOrder(id, symbol, params);
      return result;
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }

  async fetchOrder(exchangeName: string, id: string, symbol?: string, params?: any): Promise<ccxt.Order> {
    const exchange = this.getExchange(exchangeName);
    try {
      const order = await exchange.fetchOrder(id, symbol, params);
      return order;
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }

  async fetchOrders(exchangeName: string, symbol?: string, since?: number, limit?: number, params?: any): Promise<ccxt.Order[]> {
    const exchange = this.getExchange(exchangeName);
    try {
      const orders = await exchange.fetchOrders(symbol, since, limit, params);
      return orders;
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }

  async fetchOpenOrders(exchangeName: string, symbol?: string, since?: number, limit?: number, params?: any): Promise<ccxt.Order[]> {
    const exchange = this.getExchange(exchangeName);
    try {
      const orders = await exchange.fetchOpenOrders(symbol, since, limit, params);
      return orders;
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }

  async fetchClosedOrders(exchangeName: string, symbol?: string, since?: number, limit?: number, params?: any): Promise<ccxt.Order[]> {
    const exchange = this.getExchange(exchangeName);
    try {
      const orders = await exchange.fetchClosedOrders(symbol, since, limit, params);
      return orders;
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }

  async fetchMyTrades(exchangeName: string, symbol?: string, since?: number, limit?: number, params?: any): Promise<ccxt.Trade[]> {
    const exchange = this.getExchange(exchangeName);
    try {
      const trades = await exchange.fetchMyTrades(symbol, since, limit, params);
      return trades;
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }


    // Method for fetching open interest
    async fetchOpenInterest(exchangeName: string, base: string, quote: string, params?: any): Promise<any> {
      const exchange = this.getExchange(exchangeName);
      const symbol = `${base}/${quote}`;
      try {
        return await exchange.fetchOpenInterest(symbol, params);
      } catch (error) {
        this.handleCcxtException(error, exchangeName);
      }
    }
  
    // Method for fetching liquidations
    async fetchLiquidations(exchangeName: string, base: string, quote: string, since?: number, limit?: number, params?: any): Promise<any> {
      const exchange = this.getExchange(exchangeName);
      const symbol = `${base}/${quote}`;
      try {
        return await exchange.fetchLiquidations(symbol, since, limit, params);
      } catch (error) {
        this.handleCcxtException(error, exchangeName);
      }
    }
  
    // Method for fetching my liquidations
    async fetchMyLiquidations(exchangeName: string, base: string, quote: string, since?: number, limit?: number, params?: any): Promise<any> {
      const exchange = this.getExchange(exchangeName);
      const symbol = `${base}/${quote}`;
      try {
        return await exchange.fetchMyLiquidations(symbol, since, limit, params);
      } catch (error) {
        this.handleCcxtException(error, exchangeName);
      }
    }

    async fetchGreeks(exchangeName: string, base: string, quote: string, params?: any) {
      const exchange = this.getExchange(exchangeName);
      const symbol = `${base}/${quote}`;
      try {
        return await exchange.fetchGreeks(symbol, params);
      } catch (error) {
        this.handleCcxtException(error, exchangeName);
      }
    }
  
    async fetchCrossBorrowRate(exchangeName: string, code: string, params?: any) {
      const exchange = this.getExchange(exchangeName);
      try {
        return await exchange.fetchCrossBorrowRate(code, params);
      } catch (error) {
        this.handleCcxtException(error, exchangeName);
      }
    }
  
    async fetchCrossBorrowRates(exchangeName: string, params?: any) {
      const exchange = this.getExchange(exchangeName);
      try {
        return await exchange.fetchCrossBorrowRates(params);
      } catch (error) {
        this.handleCcxtException(error, exchangeName);
      }
    }
  
    async fetchIsolatedBorrowRate(exchangeName: string, base: string, quote: string, params?: any) {
      const exchange = this.getExchange(exchangeName);
      const symbol = `${base}/${quote}`;
      try {
        return await exchange.fetchIsolatedBorrowRate(symbol, params);
      } catch (error) {
        this.handleCcxtException(error, exchangeName);
      }
    }
  
    async fetchIsolatedBorrowRates(exchangeName: string, params?: any) {
      const exchange = this.getExchange(exchangeName);
      try {
        return await exchange.fetchIsolatedBorrowRates(params);
      } catch (error) {
        this.handleCcxtException(error, exchangeName);
      }
    }
  
    async fetchOption(exchangeName: string, base: string, quote: string, params?: any) {
      const exchange = this.getExchange(exchangeName);
      const symbol = `${base}/${quote}`;
      try {
        return await exchange.fetchOption(symbol, params);
      } catch (error) {
        this.handleCcxtException(error, exchangeName);
      }
    }
  
    async fetchOptionChain(exchangeName: string, code: string, params?: any) {
      const exchange = this.getExchange(exchangeName);
      try {
        return await exchange.fetchOptionChain(code, params);
      } catch (error) {
        this.handleCcxtException(error, exchangeName);
      }
    }
  
    async fetchConvertQuote(exchangeName: string, fromCode: string, toCode: string, amount: string, params?: any) {
      const exchange = this.getExchange(exchangeName);
      const fromToSymbol = `${fromCode}/${toCode}`;
      try {
        return await exchange.fetchConvertQuote(fromToSymbol, amount, params);
      } catch (error) {
        this.handleCcxtException(error, exchangeName);
      }
    }
  

  


   

  // 可以添加更多方法...

  async listSymbols(exchangeName: string): Promise<string[]> {
    const exchange = this.getExchange(exchangeName);
    try {
      const markets = await exchange.loadMarkets();
      return Object.values(markets).map((market) => market.symbol);
    } catch (error) {
      this.handleCcxtException(error, exchangeName);
    }
  }

  
  





  // 獲取 Bitget 交易所的市場列表
  //const bitgetMarkets = await exchangesService.fetchMarkets('bitget');

  // 獲取 Bybit 交易所的 BTC/USDT 行情數據
  //const bybitTicker = await exchangesService.fetchTicker('bybit', 'BTC/USDT');
}