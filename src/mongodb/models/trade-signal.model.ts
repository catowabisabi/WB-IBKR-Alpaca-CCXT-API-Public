import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/* TradeSignal (trade-signal.model.ts):
這是一個 Mongoose 模型(model),用於定義 MongoDB 中的 TradeSignal 集合(collection)的結構。
它使用 @Schema() 裝飾器將 TradeSignal 類標記為模式定義。
在 TradeSignal 類中,使用 @Prop() 裝飾器定義了各個屬性(如 account、auth、strategy 等)的類型和約束。
通過 SchemaFactory.createForClass(TradeSignal) 創建了 TradeSignalSchema,用於創建 TradeSignal 模型。
TradeSignalDocument 是 TradeSignal 類與 Mongoose Document 類型的交集,表示 TradeSignal 文檔的類型。 */



export type TradeSignalDocument = TradeSignal & Document;

class Account {
  @Prop({ required: true })
  tradingRobot: string;
  
  @Prop({ required: true })
  account: string;
  
  @Prop({ required: true })
  exchange: string;
}

class Auth {
  @Prop({ required: true })
  AID: string;
  
  @Prop({ required: true })
  apiSec: string;
}

class Strategy {
  @Prop({ required: true })
  strategy: string;
  
  @Prop({ required: true })
  strategyInfo: string;
  
  @Prop({ required: true })
  strategyTimeFrame: string;
}

class Order {
  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  usdPerTrade: number;

  @Prop({ required: true })
  margin: number;

  @Prop({ required: true })
  TdMode: string;

  @Prop({ required: true })
  OrderType: string;

  @Prop({ required: true })
  stopLossTakePorfitType: string;

  @Prop({ required: true })
  placeOrderTime: Date;

  @Prop({ required: true })
  triggerPrice: number;

  @Prop({ required: true })
  numberOfContract: number;

  @Prop({ required: true })
  tradeAction: string;
}

class PositionState {
  @Prop({ required: true })
  positionNow: string;

  @Prop({ required: true })
  priceOfPositionNow: number;

  @Prop({ required: true })
  positiionBefore: string;

  @Prop({ required: true })
  priceOfPositionBefore: number;
}

@Schema({ collection: 'signal' })
export class TradeSignal {

 

  @Prop({ type: Account, required: true })
  account: Account;


  @Prop({ required: true })
  auth:Auth;

  @Prop({ required: true })
  strategy: Strategy;

  @Prop({ required: true })
  order:Order;

  @Prop({ required: true })
  positionState: PositionState;
}

export const TradeSignalSchema = SchemaFactory.createForClass(TradeSignal);