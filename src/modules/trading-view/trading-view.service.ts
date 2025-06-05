// src/trading-view/trading-view.service.ts

import { Injectable } from '@nestjs/common';
import { TradingViewMessage } from './trading-view-message.interface';
import { Order } from '../order/order.interface';

@Injectable()
export class TradingViewService {
    processMessage(message: TradingViewMessage): Order {
        const order: Order = {
            symbol: message.symbol,
            quantity: message.position_size,
            price: message.price,
            action: message.action
        };
        
        return order;
    }
}
