export interface Order {
    symbol: string;
    quantity: string;
    price: string;
    action: string;  // 可能是 'buy' 或 'sell'
}