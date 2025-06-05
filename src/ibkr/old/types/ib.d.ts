import { EventEmitter } from "events";

declare module 'ib' {
    export class IB extends EventEmitter {
        constructor(config: { clientId: number; host: string; port: number });
        connect(): this;
        disconnect(): void;
        on(event: string, listener: (...args: any[]) => void): this;
        once(event: string, listener: (...args: any[]) => void): this;
        placeOrder(id: number, contract: Contract, order: Order): void;
        reqAccountSummary(reqId: number, group: string, tags: string): void;
        reqPositions(): void;
        reqPnL(reqId: number, account: string, modelCode: string): void;
        reqPnLSingle(reqId: number, account: string, modelCode: string, conId: number): void;
        nextValidId: number;
        openOrders(): Promise<Order[]>;
        cancelOrder(orderId: number): void;
    }

    export class Contract {
        constructor();
        symbol: string;
        secType: string;
        currency: string;
        exchange: string;
        conId?: number;
    }

    export class Order {
        constructor();
        action: string;
        orderType: string;
        totalQuantity: number;
        lmtPrice?: number;
        auxPrice?: number;
        account?: string;
        transmit?: boolean;
        parentId?: number;
    }
}
