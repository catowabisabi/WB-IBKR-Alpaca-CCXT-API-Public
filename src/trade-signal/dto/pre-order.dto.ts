import { Expose } from 'class-transformer';

export class PreOrderDto {

  @Expose({ name: 'exchange' })
  exchange: string;

  @Expose({ name: 'symbol' })
  symbol: string;

  @Expose({ name: 'useFixAmount' })
  useFixAmount: boolean;

  @Expose({ name: 'useFixOrderPercentage' })
  useFixOrderPercentage: boolean;

  @Expose({ name: 'doTrade' })
  doTrade: boolean;

  @Expose({ name: 'action' })
  action: string;

  @Expose({ name: 'orderType' })
  orderType: string;

  @Expose({ name: 'orderPrice' })
  orderPrice: number;

  @Expose({ name: 'totalQuantity' })
  totalQuantity: number;

  @Expose({ name: 'stopLossType' })
  stopLossType: string;

  @Expose({ name: 'stopLossPrice' })
  stopLossPrice: number;

  @Expose({ name: 'takeProfitType' })
  takeProfitType: string;

  @Expose({ name: 'takeProfitPrice' })
  takeProfitPrice: number;

  @Expose({ name: 'followTrend' })
  followTrend: boolean;

  @Expose({ name: 'transmit' })
  transmit: boolean;
}