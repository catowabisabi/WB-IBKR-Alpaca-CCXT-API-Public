import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Settings } from '../models/users.model';
import { FullUserSettingsDto } from './full-user-settings.dto';

export class CreateUsersDto {

  @ApiProperty({ description: '使用者名稱', example: 'johndoe' })
  @IsString()
  username?: string;


  @ApiProperty({
    description: '使用者的電子郵件',
    example: 'user@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '使用者的密碼',
    example: 'password123'
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: '使用者的名稱',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '使用者的設定',
    type: () => FullUserSettingsDto,
    example: {
      useFixAmount: false,
      fixAmountPrice: 0,
      useFixOrderPercentage: false,
      fixOrderPercentage: 0,
      useMargin: false,
      marginRatio: 0,
      orderType: null,
      stopType: null,
      profitType: null,
      useStopLossPercentage: false,
      stopLossPercentage: 0,
      useTakeProfitPercentage: false,
      takeProfitPercentage: 0,
      useTakeProfitRatio: false,
      takeProfitRatio: 0,
      useFollowTrendOrder: false,
      useIsolatedTradingMode: false,
      trading_password: '',
      ib_gateway_or_tws_port: 7497,
      ib_api_enable: true,
      ngrok_tcp_link: 'ngrok_tcp_link',
      ngrok_tcp_port: 8080,
      flagNoSignalPw: false,
      flagNoTradingPw: false,
      flagWrongPw: false,
      allowedDiffPercentageForClosingPosition: 5
    }
  })
  @ValidateNested()
  @Type(() => FullUserSettingsDto)
  settings: FullUserSettingsDto;
}