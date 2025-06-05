import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsEnum, IsObject } from 'class-validator';

export class CreateTradeSignalDto {
  @ApiProperty({
    description: '交易策略',
    example: 'MA_CROSS'
  })
  @IsString()
  @IsNotEmpty()
  strategy: string;

  @ApiProperty({
    description: '交易對',
    example: 'BTCUSDT'
  })
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty({
    description: '交易方向',
    enum: ['BUY', 'SELL'],
    example: 'BUY'
  })
  @IsEnum(['BUY', 'SELL'])
  @IsNotEmpty()
  side: 'BUY' | 'SELL';

  @ApiProperty({
    description: '訂單類型',
    enum: ['MARKET', 'LIMIT'],
    example: 'MARKET'
  })
  @IsEnum(['MARKET', 'LIMIT'])
  @IsNotEmpty()
  type: 'MARKET' | 'LIMIT';

  @ApiProperty({
    description: '價格',
    example: 50000
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: '數量',
    example: 0.1
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: '止損價',
    example: 49000,
    required: false
  })
  @IsNumber()
  stopLoss?: number;

  @ApiProperty({
    description: '止盈價',
    example: 51000,
    required: false
  })
  @IsNumber()
  takeProfit?: number;
}