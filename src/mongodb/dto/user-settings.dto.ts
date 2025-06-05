import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';

export class UserSettingsDto {
  @ApiProperty({ 
    description: '是否使用固定金額',
    default: false 
  })
  @IsBoolean()
  useFixAmount: boolean;

  @ApiProperty({ 
    description: '固定金額價格',
    example: 1000 
  })
  @IsNumber()
  @IsOptional()
  fixAmountPrice?: number;

  @ApiProperty({ 
    description: '是否使用固定訂單百分比',
    default: false 
  })
  @IsBoolean()
  useFixOrderPercentage: boolean;

  @ApiProperty({ 
    description: '固定訂單百分比',
    example: 10 
  })
  @IsNumber()
  @IsOptional()
  fixOrderPercentage?: number;

  @ApiProperty({ 
    description: '是否使用保證金',
    default: false 
  })
  @IsBoolean()
  useMargin: boolean;
} 