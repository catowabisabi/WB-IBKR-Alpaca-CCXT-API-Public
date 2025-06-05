import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';


/* CreateTradeSignalDto (create-trade-signal.dto.ts):
這是一個數據傳輸對象(DTO),用於定義創建 TradeSignal 時的數據結構和驗證規則。
它使用 class-validator 和 class-transformer 庫提供的裝飾器(如 @IsString()、@IsNotEmpty() 等)來定義屬性的驗證規則。
CreateTradeSignalDto 類的結構與 TradeSignal 模型的結構相對應,但它們是獨立的類。
當創建新的 TradeSignal 時,客戶端將發送符合 CreateTradeSignalDto 結構的數據。 */
class Account {
  @ApiProperty({ description: '交易機器人名稱', example: 'Bot1' })
  @IsString()
  @IsNotEmpty()
  tradingRobot: string;

  @ApiProperty({ description: '帳戶', example: 'main' })
  @IsString()
  @IsNotEmpty()
  account: string;

  @ApiProperty({ description: '交易所', example: 'binance' })
  @IsString()
  @IsNotEmpty()
  exchange: string;
}

class Auth {
  @ApiProperty({ description: 'API ID', example: 'api_123' })
  @IsString()
  @IsNotEmpty()
  AID: string;

  @ApiProperty({ description: 'API Secret', example: 'secret_456' })
  @IsString()
  @IsNotEmpty()
  apiSec: string;
}

class Strategy {
  @ApiProperty({ description: '策略名稱', example: 'MA_CROSS' })
  @IsString()
  @IsNotEmpty()
  strategy: string;

  @ApiProperty({ description: '策略說明', example: '移動平均線交叉策略' })
  @IsString()
  @IsNotEmpty()
  strategyInfo: string;

  @ApiProperty({ description: '策略時間週期', example: '1h' })
  @IsString()
  @IsNotEmpty()
  strategyTimeFrame: string;
}

class Order {
  @ApiProperty({ description: '交易對', example: 'BTCUSDT' })
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty({ description: '每筆交易金額', example: '1000' })
  @IsNumber()
  @IsNotEmpty()
  usdPerTrade: number;

  @ApiProperty({ description: '槓桿倍數', example: 2 })
  @IsNumber()
  @IsNotEmpty()
  margin: number;

  @ApiProperty({ description: '交易模式', example: 'ISOLATED' })
  @IsString()
  @IsNotEmpty()
  TdMode: string;

  @ApiProperty({ description: '訂單類型', example: 'LIMIT' })
  @IsString()
  @IsNotEmpty()
  OrderType: string;

  @ApiProperty({ description: '止損止盈類型', example: 'TP_SL' })
  @IsString()
  @IsNotEmpty()
  stopLossTakePorfitType: string;

  @ApiProperty({ description: '下單時間', example: '2024-03-20T10:00:00Z' })
  @IsNotEmpty()
  placeOrderTime: Date;

  @ApiProperty({ description: '觸發價格', example: 50000 })
  @IsNumber()
  @IsNotEmpty()
  triggerPrice: number;

  @ApiProperty({ description: '合約數量', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  numberOfContract: number;

  @ApiProperty({ description: '交易動作', example: 'BUY' })
  @IsString()
  @IsNotEmpty()
  tradeAction: string;
}

class PositionState {
  @ApiProperty({ description: '當前倉位狀態', example: 'LONG' })
  @IsString()
  @IsNotEmpty()
  positionNow: string;

  @ApiProperty({ description: '當前倉位價格', example: 50000 })
  @IsNumber()
  @IsNotEmpty()
  priceOfPositionNow: number;

  @ApiProperty({ description: '之前倉位狀態', example: 'FLAT' })
  @IsString()
  @IsNotEmpty()
  positiionBefore: string;

  @ApiProperty({ description: '之前倉位價格', example: 49000 })
  @IsNumber()
  @IsNotEmpty()
  priceOfPositionBefore: number;
}

export class CreateTradeSignalDto {
  @ApiProperty({ type: Account })
  @ValidateNested()
  @Type(() => Account)
  account: Account;

  @ApiProperty({ type: Auth })
  @ValidateNested()
  @Type(() => Auth)
  auth: Auth;

  @ApiProperty({ type: Strategy })
  @ValidateNested()
  @Type(() => Strategy)
  strategy: Strategy;

  @ApiProperty({ type: Order })
  @ValidateNested()
  @Type(() => Order)
  order: Order;

  @ApiProperty({ type: PositionState })
  @ValidateNested()
  @Type(() => PositionState)
  positionState: PositionState;
}