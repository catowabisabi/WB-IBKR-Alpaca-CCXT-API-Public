import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, ServiceUnavailableException, InternalServerErrorException } from '@nestjs/common';
import * as ccxt from 'ccxt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExchangesService2 {
  private exchanges: { [key: string]: ccxt.Exchange } = {};

  constructor(private configService: ConfigService) {
    this.initializeExchanges();
}

  private initializeExchanges() {
    const exchangeList: { id: string, class: any }[] = [
        { id: 'binance', class: ccxt.binance },
        { id: 'coinbase', class: ccxt.coinbase },
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

      this.exchanges[exchange.id] = new exchange.class(options);
  });
}

  async fetchMarkets(exchangeName: string): Promise<ccxt.Market[]> {
    const exchange = this.exchanges[exchangeName];
    if (!exchange) {
      throw new Error(`Exchange ${exchangeName} not found`);
    }
    const markets = await exchange.loadMarkets();
    console.log( `\n\n\nThe first market of ${exchangeName} is :\n`)
    console.log(Object.values(markets)[0]);
    return Object.values(markets);
  }

  async fetchTicker(exchangeName: string, symbol: string) {
    const exchange = new ccxt[exchangeName.toLowerCase()]({ 'enableRateLimit': true });

    try {

        await exchange.loadMarkets();
        if (!exchange.markets[symbol]) {
            throw new NotFoundException(`Symbol ${symbol} not found in exchange ${exchangeName}`);
        }
        const ticker = await exchange.fetchTicker(symbol);
        console.log(ticker)
        return ticker;
    } catch (error) {
        if (error instanceof ccxt.NetworkError) {
            throw new BadRequestException('Network error when trying to reach exchange');
        } else if (error instanceof ccxt.AuthenticationError) {
            throw new UnauthorizedException('Authentication error with exchange credentials');
        } else if (error instanceof ccxt.ExchangeNotAvailable) {
            throw new ServiceUnavailableException('Exchange not available');
        } else if (error instanceof ccxt.ExchangeError) {
            throw new BadRequestException('Exchange error occurred');
        } else {
            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }
  }

  async listSymbols(exchangeName: string): Promise<string[]> {
    const exchange = this.exchanges[exchangeName];
    if (!exchange) {
      throw new Error(`Exchange ${exchangeName} not found`);
    }
    
    try {
      const markets = await exchange.loadMarkets();
      return Object.values(markets).map((market) => market.symbol);
    } catch (error) {
      console.error(`Failed to load symbols for exchange ${exchangeName}:`, error);
      throw error;
    }
  }

  async fetchOrderBook(exchangeName: string, symbol: string, limit: number = 100) {
    const exchange = this.exchanges[exchangeName];
    if (!exchange) {
        throw new NotFoundException(`Exchange ${exchangeName} not found`);
    }
    return await exchange.fetchOrderBook(symbol, limit);
}

async fetchTrades(exchangeName: string, symbol: string) {
    const exchange = this.exchanges[exchangeName];
    if (!exchange) {
        throw new NotFoundException(`Exchange ${exchangeName} not found`);
    }
    return await exchange.fetchTrades(symbol);
}

async createOrder(exchangeName: string, symbol: string, type: string, side: string, amount: number, price?: number) {
    const exchange = this.exchanges[exchangeName];
    if (!exchange) {
        throw new NotFoundException(`Exchange ${exchangeName} not found`);
    }
    return await exchange.createOrder(symbol, type, side, amount, price);
}

async cancelOrder(exchangeName: string, id: string) {
    const exchange = this.exchanges[exchangeName];
    if (!exchange) {
        throw new NotFoundException(`Exchange ${exchangeName} not found`);
    }
    return await exchange.cancelOrder(id);
}

async fetchBalance(exchangeName: string) {
    const exchange = this.exchanges[exchangeName];
    if (!exchange) {
        throw new NotFoundException(`Exchange ${exchangeName} not found`);
    }
    return await exchange.fetchBalance();
}

async withdraw(exchangeName: string, code: string, amount: number, address: string, params: object = {}) {
    const exchange = this.exchanges[exchangeName];
    if (!exchange) {
        throw new NotFoundException(`Exchange ${exchangeName} not found`);
    }
    return await exchange.withdraw(code, amount, address, params);
}
  

  // 可以添加更多方法... 
}