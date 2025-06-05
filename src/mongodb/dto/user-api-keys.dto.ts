import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class BinanceKeysDto {
  @ApiProperty({ description: 'Binance API Key' })
  @IsString()
  @IsOptional()
  key?: string;

  @ApiProperty({ description: 'Binance Secret Key' })
  @IsString()
  @IsOptional()
  secret?: string;
}

export class UserApiKeysDto {
  @ApiProperty({ 
    description: 'Binance API 密鑰',
    type: () => BinanceKeysDto 
  })
  @IsOptional()
  binance?: BinanceKeysDto;

  @ApiProperty({ 
    description: 'OKX API Key',
    type: String 
  })
  @IsString()
  @IsOptional()
  okxKey?: string;

  @ApiProperty({ 
    description: 'Bybit API Key',
    type: String 
  })
  @IsString()
  @IsOptional()
  bybitKey?: string;
} 