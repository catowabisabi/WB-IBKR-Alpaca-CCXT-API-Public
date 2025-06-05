import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class AlpacaRequestDto {
  @ApiProperty({
    description: 'API 端點',
    example: '/v2/orders'
  })
  @IsString()
  endpoint: string;

  @ApiProperty({
    description: 'HTTP 方法',
    example: 'POST',
    enum: ['GET', 'POST', 'PUT', 'DELETE']
  })
  @IsString()
  method: string;

  @ApiProperty({
    description: '使用者電子郵件',
    example: 'trader@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '交易模式',
    example: 'paper',
    enum: ['paper', 'live']
  })
  @IsString()
  mode: string;

  @ApiProperty({
    description: '請求參數',
    example: { symbol: 'AAPL', qty: 100, side: 'buy', type: 'market' },
    required: false
  })
  @IsOptional()
  params?: any;

  @ApiProperty({
    description: '請求 ID',
    example: 'order_123',
    required: false
  })
  @IsString()
  @IsOptional()
  id?: string;
}