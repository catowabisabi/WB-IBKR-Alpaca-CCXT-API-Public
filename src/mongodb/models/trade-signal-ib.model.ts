// src/mongodb/models/trade-signal-ib.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type TradeSignalIBDocument = TradeSignalIB & Document;

class Account {
  @Prop({ required: true })
  account: string;
  
  @Prop({ required: true })
  password: string;
}

class Strategy {
  @Prop({ required: true })
  strategy: string;
  
  @Prop({ required: true })
  strategyTimeFrame: string;
}

class Order {
  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  type: string;

  
  @Prop({ required: true })
  currency: string;
  
  @Prop({ required: true })
  usdPerTrade: number;
  
  @Prop({ required: true })
  margin: number;
  
  @Prop({ required: true })
  exchange: string;
  
  @Prop({ required: true })
  placeOrderTime: Date;
  
  @Prop({ required: true })
  tradeAction: string;
  
  @Prop({ required: true })
  numberOfContract: number;
  
  @Prop({ required: true })
  triggerPrice: number;
  
  @Prop({ required: true })
  setupOrderType: string;
  
  @Prop({ required: true })
  closePositionType: string;
}

@Schema({ collection: 'signal-ib' })
export class TradeSignalIB {
  @Prop({ type: Account, required: true })
  account: Account;
  
  @Prop({ type: Strategy, required: true })
  strategy: Strategy;
  
  @Prop({ type: Order, required: true })
  order: Order;
}

export const TradeSignalIBSchema = SchemaFactory.createForClass(TradeSignalIB);