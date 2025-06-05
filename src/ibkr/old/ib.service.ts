import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { OrderService } from '../../modules/order/order-service.interface';
import { Order } from '../../modules/order/order.interface';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class IbService implements OrderService {
    private baseUrl = 'https://api.interactivebrokers.com';

    constructor(private httpService: HttpService) {}

    async makeOrder(order: Order): Promise<any> {
        const config = {
            headers: { 'Authorization': `Bearer ${process.env.IB_API_KEY}` }
        };
        const response = this.httpService.post(`${this.baseUrl}/order`, order, config);
        return lastValueFrom(response);
    }
    async connectToIb(){}
}
