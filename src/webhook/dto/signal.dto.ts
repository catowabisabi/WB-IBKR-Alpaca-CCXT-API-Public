import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class SignalDto {
  @ApiProperty({
    description: '交易對',
    example: 'BTCUSDT'
  })
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty({
    description: '交易動作',
    example: 'BUY'
  })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({
    description: '價格',
    example: 50000
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: '數量',
    example: 0.1
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: '策略名稱',
    example: 'MA_CROSS'
  })
  @IsString()
  @IsNotEmpty()
  strategy: string;

  @ApiProperty({
    description: '時間戳',
    example: '2024-03-20T10:00:00Z'
  })
  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @ApiProperty({
    description: '備註',
    example: 'MA50 crossed above MA200',
    required: false
  })
  @IsString()
  @IsOptional()
  note?: string;
} 