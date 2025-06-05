import { IsEmail, IsOptional, IsString } from "class-validator";

export class AssetRequestDto {
    @IsEmail()
    @IsString()
    email: string;

    @IsString()
    mode:string

    @IsString()
    @IsOptional()
    symbol:string
  }