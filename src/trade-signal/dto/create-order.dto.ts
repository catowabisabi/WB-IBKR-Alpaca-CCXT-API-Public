import { Expose } from 'class-transformer';

export class CreateOrderDto {
  @Expose({ name: 'symbol' })
  symbol: string;

  @Expose({ name: 'usdPerTrade' })
  usdPerTrade: string;

  @Expose({ name: 'margin' })
  margin: number;

  @Expose({ name: 'TdMode' })
  TdMode: string;

  @Expose({ name: 'OrderType' })
  OrderType: string;

  @Expose({ name: 'stopLossTakePorfitType' })
  stopLossTakePorfitType: string;

  @Expose({ name: 'placeOrderTime' })
  placeOrderTime: string;

  @Expose({ name: 'triggerPrice' })
  triggerPrice: number;

  @Expose({ name: 'numberOfContract' })
  numberOfContract: number;

  @Expose({ name: 'tradeAction' })
  tradeAction: string;
}