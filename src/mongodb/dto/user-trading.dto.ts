import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';

export class UserTradingDto {
  @ApiProperty({ 
    description: '訂單類型',
    enum: ['MKT', 'LMT', null],
    default: null 
  })
  @IsEnum(['MKT', 'LMT', null])
  @IsOptional()
  orderType: 'MKT' | 'LMT' | null;

  @ApiProperty({ 
    description: '止損類型',
    enum: ['MKT', 'LMT', null],
    default: null 
  })
  @IsEnum(['MKT', 'LMT', null])
  @IsOptional()
  stopType: 'MKT' | 'LMT' | null;

  @ApiProperty({ 
    description: '止盈類型',
    enum: ['MKT', 'LMT', null],
    default: null 
  })
  @IsEnum(['MKT', 'LMT', null])
  @IsOptional()
  profitType: 'MKT' | 'LMT' | null;

  @ApiProperty({ 
    description: '是否使用止損百分比',
    default: false 
  })
  @IsBoolean()
  useStopLossPercentage: boolean;

  @ApiProperty({ 
    description: '止損百分比',
    example: 5 
  })
  @IsNumber()
  @IsOptional()
  stopLossPercentage?: number;
} 