// src/platforms/binance.service.ts

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Order } from '../order/order.interface';
import { OrderService } from '../order/order-service.interface';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BinanceService implements OrderService {
    private baseUrl = 'https://api.binance.com';

    constructor(private httpService: HttpService) {}

    async makeOrder(order: Order): Promise<any> {
        const config = {
            headers: { 'X-MBX-APIKEY': process.env.BINANCE_API_KEY }
        };
        const response = this.httpService.post(`${this.baseUrl}/api/v3/order`, order, config);
        return lastValueFrom(response);
    }
}
