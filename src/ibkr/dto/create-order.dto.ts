// src/orders/dto/create-order.dto.ts

import { OrderAction, OrderType, SecType } from '@stoqey/ib';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    symbol: string;

    @IsString()
    @IsNotEmpty()
    secType: SecType;
    @IsString()
    @IsNotEmpty()
    currency: string;
    @IsString()
    @IsNotEmpty()
    exchange: string;
    @IsString()
    @IsNotEmpty()
    action: OrderAction;
    @IsString()
    @IsNotEmpty()
    orderType: OrderType;
    @IsNumber()
    @IsNotEmpty()
    totalQuantity: number;
    @IsNumber()
    lmtPrice?: number;
    @IsNumber()
    auxPrice?: number;
}
