import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class Settings {
  @ApiProperty({ description: '是否使用固定金額', default: false })
  @Prop({ required: true, default: false })
  useFixAmount: boolean;

  @ApiProperty({ description: '固定金額價格', example: 1000 })
  @Prop()
  fixAmountPrice: number;

  @ApiProperty({ description: '是否使用固定訂單百分比', default: false })
  @Prop({ required: true, default: false })
  useFixOrderPercentage: boolean;

  @ApiProperty({ description: '固定訂單百分比', example: 10 })
  @Prop()
  fixOrderPercentage: number;

  @ApiProperty({ description: '是否使用保證金', default: false })
  @Prop({ default: false })
  useMargin: boolean;

  @ApiProperty({ description: '保證金比率', example: 2 })
  @Prop()
  marginRatio: number;

  @ApiProperty({ description: '訂單類型', enum: ['MKT', 'LMT', null], default: null })
  @Prop({ enum: ['MKT', 'LMT', null], default: null })
  orderType: 'MKT' | 'LMT' | null;

  @ApiProperty({ description: '止損類型', enum: ['MKT', 'LMT', null], default: null })
  @Prop({ enum: ['MKT', 'LMT', null], default: null })
  stopType: 'MKT' | 'LMT' | null;

  @ApiProperty({ description: '止盈類型', enum: ['MKT', 'LMT', null], default: null })
  @Prop({ enum: ['MKT', 'LMT', null], default: null })
  profitType: 'MKT' | 'LMT' | null;

  @ApiProperty({ description: '是否使用止損百分比', default: false })
  @Prop({ default: false })
  useStopLossPercentage: boolean;

  @ApiProperty({ description: '止損百分比', example: 5 })
  @Prop()
  stopLossPercentage: number;

  @ApiProperty({ description: '是否使用止盈百分比', default: false })
  @Prop({ default: false })
  useTakeProfitPercentage: boolean;

  @ApiProperty({ description: '止盈百分比', example: 10 })
  @Prop()
  takeProfitPercentage: number;

  @ApiProperty({ description: '是否使用止盈比率', default: false })
  @Prop({ default: false })
  useTakeProfitRatio: boolean;

  @ApiProperty({ description: '止盈比率', example: 2 })
  @Prop()
  takeProfitRatio: number;

  @ApiProperty({ description: '是否使用跟隨趨勢訂單', default: false })
  @Prop({ default: false })
  useFollowTrendOrder: boolean;

  @ApiProperty({ description: '是否使用隔離交易模式', default: false })
  @Prop({ default: false })
  useIsolatedTradingMode: boolean;

  @ApiProperty({ description: '交易密碼' })
  @Prop()
  trading_password: string;

  @ApiProperty({ description: 'IB Gateway/TWS 端口', default: 7497 })
  @Prop({ default: 7497 })
  ib_gateway_or_tws_port: number;

  @ApiProperty({ description: '是否啟用 IB API', default: true })
  @Prop({ default: true })
  ib_api_enable: boolean;

  @ApiProperty({ description: 'Ngrok TCP 連結', default: "ngrok_tcp_link" })
  @Prop({ default: "ngrok_tcp_link" })
  ngrok_tcp_link: string;

  @ApiProperty({ description: 'Ngrok TCP 端口', default: 8080 })
  @Prop({ default: 8080 })
  ngrok_tcp_port: number;

  @ApiProperty({ description: '無信號密碼標記', default: false })
  @Prop({ default: false })
  flagNoSignalPw: boolean;

  @ApiProperty({ description: '無交易密碼標記', default: false })
  @Prop({ default: false })
  flagNoTradingPw: boolean;

  @ApiProperty({ description: '密碼錯誤標記', default: false })
  @Prop({ default: false })
  flagWrongPw: boolean;

  @ApiProperty({ description: '允許的平倉差價百分比', default: 5 })
  @Prop({ default: 5 })
  allowedDiffPercentageForClosingPosition: number;
}

@Schema()
class BinanceKeys {
  @ApiProperty({ description: 'Binance API Key' })
  @Prop()
  key: string;
  
  @ApiProperty({ description: 'Binance Secret Key' })
  @Prop()
  secret: string;
}
export const BinanceKeysSchema = SchemaFactory.createForClass(BinanceKeys);

@Schema()
class AlpacaPaperKeys {
  @ApiProperty({ description: 'Alpaca Paper API Key' })
  @Prop()
  key: string;

  @ApiProperty({ description: 'Alpaca Paper Secret Key' })
  @Prop()
  secret: string;
}
export const AlpacaPaperKeysSchema = SchemaFactory.createForClass(AlpacaPaperKeys);

@Schema()
class AlpacaLiveKeys {
  @ApiProperty({ description: 'Alpaca Live API Key' })
  @Prop()
  key: string;

  @ApiProperty({ description: 'Alpaca Live Secret Key' })
  @Prop()
  secret: string;
}
export const AlpacaLiveKeyssSchema = SchemaFactory.createForClass(AlpacaLiveKeys);

@Schema()
class OkxKeys {
  @ApiProperty({ description: 'OKX API Key' })
  @Prop()
  key: string;
}
export const OkxKeysSchema = SchemaFactory.createForClass(OkxKeys);

@Schema()
class BybitKeys {
  @ApiProperty({ description: 'Bybit API Key' })
  @Prop()
  key: string;
}
export const BybitKeysSchema = SchemaFactory.createForClass(BybitKeys);

@Schema()
export class Keys {
  @ApiProperty({ description: 'Binance API 密鑰', type: () => BinanceKeys })
  @Prop({ type: BinanceKeysSchema, default: {} })
  binance: BinanceKeys;

  @ApiProperty({ description: 'OKX API 密鑰', type: () => OkxKeys })
  @Prop({ type: OkxKeysSchema, default: {} })
  okx: OkxKeys;

  @ApiProperty({ description: 'Bybit API 密鑰', type: () => BybitKeys })
  @Prop({ type: BybitKeysSchema, default: {} })
  bybit: BybitKeys;

  @ApiProperty({ description: 'Alpaca Paper API 密鑰', type: () => AlpacaPaperKeys })
  @Prop({ type: AlpacaPaperKeysSchema, default: {} })
  alpacaPaper: AlpacaPaperKeys;

  @ApiProperty({ description: 'Alpaca Live API 密鑰', type: () => AlpacaLiveKeys })
  @Prop({ type: AlpacaLiveKeyssSchema, default: {} })
  alpacaLive: AlpacaLiveKeys;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);

@Schema({ collection: 'users' })
export class User {
  @ApiProperty({ description: '使用者名稱' })
  @Prop({ required: true })
  username: string;

  @ApiProperty({ description: '使用者電子郵件' })
  @Prop({ required: true })
  email: string;

  @ApiProperty({ description: '使用者密碼' })
  @Prop()
  password: string;

  @ApiProperty({ description: '使用者設定', type: () => Settings })
  @Prop({ type: Settings, required: true })
  settings: Settings;

  @ApiProperty({ description: 'API 密鑰設定', type: () => Keys })
  @Prop({ type: Keys })
  keys: Keys;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
