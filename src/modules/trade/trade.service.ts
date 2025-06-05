// src/trade/trade.service.ts

import { Injectable } from '@nestjs/common';
import { OrderService } from '../order/order-service.interface';
import { Order } from '../order/order.interface';

@Injectable()
export class TradeService {
    private orderService: OrderService;

    constructor(orderService: OrderService) {
        this.orderService = orderService;
    }

    executeOrder(order: Order) {
        return this.orderService.makeOrder(order);
    }
}
