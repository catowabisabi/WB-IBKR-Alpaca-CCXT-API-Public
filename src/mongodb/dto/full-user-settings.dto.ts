import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';

export class FullUserSettingsDto {
  @ApiProperty({ description: '是否使用固定金額', default: false, required: false })
  @IsBoolean()
  @IsOptional()
  useFixAmount?: boolean;

  @ApiProperty({ description: '固定金額價格', example: 1000, required: false })
  @IsNumber()
  @IsOptional()
  fixAmountPrice?: number;

  @ApiProperty({ description: '是否使用固定訂單百分比', default: false, required: false })
  @IsBoolean()
  @IsOptional()
  useFixOrderPercentage?: boolean;

  @ApiProperty({ description: '固定訂單百分比', example: 10, required: false })
  @IsNumber()
  @IsOptional()
  fixOrderPercentage?: number;

  @ApiProperty({ description: '是否使用保證金', default: false, required: false })
  @IsBoolean()
  @IsOptional()
  useMargin?: boolean;

  @ApiProperty({ description: '保證金比例', example: 0.5, required: false })
  @IsNumber()
  @IsOptional()
  marginRatio?: number;

  @ApiProperty({ description: '訂單類型', example: 'LMT', required: false })
  @IsString()
  @IsOptional()
  orderType?: string;

  @ApiProperty({ description: '停損類型', example: 'TRAIL', required: false })
  @IsString()
  @IsOptional()
  stopType?: string;

  @ApiProperty({ description: '獲利類型', example: 'LIMIT', required: false })
  @IsString()
  @IsOptional()
  profitType?: string;

  @ApiProperty({ description: '是否使用停損百分比', default: false, required: false })
  @IsBoolean()
  @IsOptional()
  useStopLossPercentage?: boolean;

  @ApiProperty({ description: '停損百分比', example: 5, required: false })
  @IsNumber()
  @IsOptional()
  stopLossPercentage?: number;

  @ApiProperty({ description: '是否使用止盈百分比', default: false, required: false })
  @IsBoolean()
  @IsOptional()
  useTakeProfitPercentage?: boolean;

  @ApiProperty({ description: '止盈百分比', example: 8, required: false })
  @IsNumber()
  @IsOptional()
  takeProfitPercentage?: number;

  @ApiProperty({ description: '是否使用止盈比例', default: false, required: false })
  @IsBoolean()
  @IsOptional()
  useTakeProfitRatio?: boolean;

  @ApiProperty({ description: '止盈比例', example: 1.5, required: false })
  @IsNumber()
  @IsOptional()
  takeProfitRatio?: number;

  @ApiProperty({ description: '是否使用趨勢跟單', default: false, required: false })
  @IsBoolean()
  @IsOptional()
  useFollowTrendOrder?: boolean;

  @ApiProperty({ description: '是否使用獨立交易模式', default: false, required: false })
  @IsBoolean()
  @IsOptional()
  useIsolatedTradingMode?: boolean;

  @ApiProperty({ description: '交易密碼', example: 'abc123', required: false })
  @IsString()
  @IsOptional()
  trading_password?: string;

  @ApiProperty({ description: 'IB Gateway 或 TWS Port', example: 7497, required: false })
  @IsNumber()
  @IsOptional()
  ib_gateway_or_tws_port?: number;

  @ApiProperty({ description: '是否啟用 IB API', default: true, required: false })
  @IsBoolean()
  @IsOptional()
  ib_api_enable?: boolean;

  @ApiProperty({ description: 'Ngrok TCP Link', example: 'tcp://xyz.ngrok.io', required: false })
  @IsString()
  @IsOptional()
  ngrok_tcp_link?: string;

  @ApiProperty({ description: 'Ngrok TCP Port', example: 8080, required: false })
  @IsNumber()
  @IsOptional()
  ngrok_tcp_port?: number;

  @ApiProperty({ description: '無訊號密碼旗標', default: false, required: false })
  @IsBoolean()
  @IsOptional()
  flagNoSignalPw?: boolean;

  @ApiProperty({ description: '無交易密碼旗標', default: false, required: false })
  @IsBoolean()
  @IsOptional()
  flagNoTradingPw?: boolean;

  @ApiProperty({ description: '錯誤密碼旗標', default: false, required: false })
  @IsBoolean()
  @IsOptional()
  flagWrongPw?: boolean;

  @ApiProperty({ description: '允許平倉時的價格誤差百分比', example: 5, required: false })
  @IsNumber()
  @IsOptional()
  allowedDiffPercentageForClosingPosition?: number;
}
