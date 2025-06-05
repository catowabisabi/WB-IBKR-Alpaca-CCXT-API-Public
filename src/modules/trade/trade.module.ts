import { Module } from '@nestjs/common';
import { BinanceService } from '../binance/binance.service';

import { HttpModule } from '@nestjs/axios';

export const ORDER_SERVICE = 'ORDER_SERVICE';
@Module({
    imports: [HttpModule],
    providers: [
        {
            provide: ORDER_SERVICE,
            useClass: BinanceService
        },
        
        
    ],
    exports: [ORDER_SERVICE]  // 导出使用字符串标识符
})
export class TradeModule {}
