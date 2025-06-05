import { Module } from '@nestjs/common';
import { TradingViewController } from './trading-view.controller'
import { TradingViewService } from './trading-view.service'

@Module({
    imports: [],
    providers: [TradingViewService],
    controllers: [TradingViewController], // 使配置全局可用
})
export class TradingViewModule {}
