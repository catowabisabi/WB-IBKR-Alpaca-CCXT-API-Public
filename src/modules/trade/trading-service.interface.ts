import { Order } from '../order/order.interface';

export interface TradingService {
    makeOrder(order: Order): Promise<any>;
}