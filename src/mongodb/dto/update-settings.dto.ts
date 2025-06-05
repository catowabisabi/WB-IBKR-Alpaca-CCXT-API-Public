import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @IsOptional()
  identifier: string;

  @IsBoolean()
  @IsOptional()
  useFixAmount?: boolean;

  @IsNumber()
  @IsOptional()
  fixAmountPrice?: number;

  @IsBoolean()
  @IsOptional()
  useFixOrderPercentage?: boolean;

  @IsNumber()
  @IsOptional()
  fixOrderPercentage?: number;

  @IsBoolean()
  @IsOptional()
  useMargin?: boolean;

  @IsNumber()
  @IsOptional()
  marginRatio?: number;

  @IsEnum(['MKT', 'LMT', null])
  @IsOptional()
  orderType?: 'MKT' | 'LMT' | null;

  @IsEnum(['MKT', 'LMT', null])
  @IsOptional()
  stopType?: 'MKT' | 'LMT' | null;

  @IsEnum(['MKT', 'LMT', null])
  @IsOptional()
  profitType?: 'MKT' | 'LMT' | null;

  @IsBoolean()
  @IsOptional()
  useStopLossPercentage?: boolean;

  @IsNumber()
  @IsOptional()
  stopLossPercentage?: number;

  @IsBoolean()
  @IsOptional()
  useTakeProfitRatio?: boolean;

  @IsNumber()
  @IsOptional()
  takeProfitRatio?: number;

  @IsBoolean()
  @IsOptional()
  useFollowTrendOrder?: boolean;

  @IsBoolean()
  @IsOptional()
  useIsolatedTradingMode?: boolean;

  @ApiProperty({
    description: '交易密碼',
    required: false
  })
  @IsString()
  @IsOptional()
  trading_password?: string;

  @ApiProperty({
    description: 'IB Gateway/TWS 端口',
    default: 7497,
    required: false
  })
  @IsNumber()
  @IsOptional()
  ib_gateway_or_tws_port?: number;

  @ApiProperty({
    description: '是否啟用 IB API',
    default: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  ib_api_enable?: boolean;

  @ApiProperty({
    description: 'Ngrok TCP 連結',
    default: 'ngrok_tcp_link',
    required: false
  })
  @IsString()
  @IsOptional()
  ngrok_tcp_link?: string;

  @ApiProperty({
    description: 'Ngrok TCP 端口',
    default: 8080,
    required: false
  })
  @IsNumber()
  @IsOptional()
  ngrok_tcp_port?: number;

  @IsBoolean()
  @IsOptional()
  flagNoSignalPw?: boolean

  @IsBoolean()
  @IsOptional()
  flagNoTradingPw?: boolean

  @IsBoolean()
  @IsOptional()
  flagWrongPw?: boolean
}