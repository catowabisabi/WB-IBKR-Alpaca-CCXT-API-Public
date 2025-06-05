
/* CreateTradeSignalDto (create-trade-signal.dto.ts):
這是一個數據傳輸對象(DTO),用於定義創建 TradeSignal 時的數據結構和驗證規則。
它使用 class-validator 和 class-transformer 庫提供的裝飾器(如 @IsString()、@IsNotEmpty() 等)來定義屬性的驗證規則。
CreateTradeSignalDto 類的結構與 TradeSignal 模型的結構相對應,但它們是獨立的類。
當創建新的 TradeSignal 時,客戶端將發送符合 CreateTradeSignalDto 結構的數據。 */

import { IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Account {
  @IsString()
  @IsNotEmpty()
  account: string;
  
  @IsString()
  @IsNotEmpty()
  password: string;
}

class Strategy {
  @IsString()
  @IsNotEmpty()
  strategy: string;
  
  @IsString()
  @IsNotEmpty()
  strategyTimeFrame: string;
}

class Order {
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsString()
  @IsNotEmpty()
  type: string;
  
  @IsString()
  @IsNotEmpty()
  currency: string;
  
  @IsNumber()
  @IsNotEmpty()
  usdPerTrade: number;
  
  @IsNumber()
  @IsNotEmpty()
  margin: number;
  
  @IsString()
  @IsNotEmpty()
  exchange: string;
  
  @IsNotEmpty()
  placeOrderTime: Date;
  
  @IsString()
  @IsNotEmpty()
  tradeAction: string;
  
  @IsNumber()
  @IsNotEmpty()
  numberOfContract: number;
  
  @IsNumber()
  @IsNotEmpty()
  triggerPrice: number;
  
  @IsString()
  @IsNotEmpty()
  setupOrderType: string;
  
  @IsString()
  @IsNotEmpty()
  closePositionType: string;
}

export class CreateTradeSignalIBDto {
  @ValidateNested()
  @Type(() => Account)
  account: Account;
  
  @ValidateNested()
  @Type(() => Strategy)
  strategy: Strategy;
  
  @ValidateNested()
  @Type(() => Order)
  order: Order;
}