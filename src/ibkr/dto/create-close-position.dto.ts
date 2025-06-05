// src/orders/dto/create-order.dto.ts

import { OrderAction, OrderType, SecType } from '@stoqey/ib';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateClosePositionDto {
    @IsString()
    @IsNotEmpty()
    symbol: string;

    @IsString()
    @IsNotEmpty()
    orderType: OrderType;

    @IsNumber()
    @IsNotEmpty()
    totalQuantity: number;

    @IsNumber()
    lmtPrice?: number;
}
