import { Order } from './order.interface';

export interface OrderService {
    makeOrder(order: Order): Promise<any>;
}