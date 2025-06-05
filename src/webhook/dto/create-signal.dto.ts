
import { IsOptional, IsString, IsNumber} from "class-validator";

export class CreateSignalDto {}
// signal.dto.ts
export class SignalDto {
    @IsString()
    帳戶: string;

    @IsString()
    @IsOptional()
    密碼: string;

    @IsString()
    @IsOptional()
    策略: string;

    @IsOptional()
    @IsString()
    週期: string;
    
    @IsString()
    股票: string;

    @IsString()
    類別: string;

    
    @IsString()
    @IsOptional()
    單位: string;
    @IsOptional()
    @IsNumber({},{each: true})
    每注: number;
    @IsOptional()
    @IsNumber({},{each: true})
    倍數: number;
    @IsOptional()
    @IsString()
    交易所: string;
    @IsString()
    @IsOptional()
    時間: string;
    @IsString()
    交易動作: string;

    @IsNumber({},{each: true})
    @IsOptional()
    
    交易股數: number;
    @IsString()
    @IsOptional()
    價格: string;
    @IsOptional()
    @IsString()
    @IsOptional()
    建倉類型: string;
    @IsOptional()
    @IsString()
    平倉類型: string;
  }

  