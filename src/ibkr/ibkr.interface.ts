import { Contract, Order, OrderState } from "@stoqey/ib";

export interface MyOpenOrder {
    orderId: number;
    contract: Contract;
    order: Order;
    orderState: OrderState;
}

export interface Position {
    account: string;
    contract: Contract;
    pos: number;
    avgCost?: number;
  }