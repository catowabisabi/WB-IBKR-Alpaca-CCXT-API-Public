// mongo-signal.dto.ts
export class MongoDBSignalDto {

    account: {
      account: string;
      password: string | null;
    };
    strategy: {
      strategy: string | null;
      strategyTimeFrame: string | null;
    };
    order: {
      symbol: string;
      type:string;
      currency: string | null;
      usdPerTrade: number | null;
      margin: number | null;
      exchange: string | null;
      placeOrderTime: Date | null;
      tradeAction: string | null;
      numberOfContract: number | null;
      triggerPrice: number | null;
      setupOrderType: string | null;
      closePositionType: string | null;
    };

    constructor(data: Partial<MongoDBSignalDto> = {}) {
      const currentDate = new Date();

      
      /* console.log("\n\n\ncurrentDate\n")
      console.log(currentDate)
      console.log("\ncurrentDate\n\n") */

      
      currentDate.setMilliseconds(0);
      this.account = {
        account: data.account?.account || null,
        password: data.account?.password || null,
      };
  
      this.strategy = {
        strategy: data.strategy?.strategy || '無策略',
        strategyTimeFrame: data.strategy?.strategyTimeFrame || 'N/A',
      };
      this.order = {
        symbol: data.order?.symbol || null,
        type:data.order?.type || 'US Stock',
        currency: data.order?.currency || 'N/A',
        usdPerTrade: data.order?.usdPerTrade || 0,
        margin: data.order?.margin || 1,
        exchange: data.order?.exchange || 'N/A',
        placeOrderTime: data.order?.placeOrderTime instanceof Date ? data.order.placeOrderTime : currentDate,
        tradeAction: data.order?.tradeAction || 'N/A',
        numberOfContract: data.order?.numberOfContract || null,
        triggerPrice: data.order?.triggerPrice || 0,
        setupOrderType: data.order?.setupOrderType || '無指定',
        closePositionType: data.order?.closePositionType || '無指定',
      };
      
    }
  }
  
  