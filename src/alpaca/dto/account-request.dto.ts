import { IsEmail, IsOptional, IsString } from "class-validator";

export class AccountRequestDto {
    @IsEmail()
    @IsString()
    email: string;

    @IsString()
    mode:string


  }