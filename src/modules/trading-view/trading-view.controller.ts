import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { TradingViewMessage } from './trading-view-message.interface';
import { TradingViewService } from './trading-view.service';
import { TradeService } from '../trade/trade.service';
import { AdminApiKeyGuard } from 'src/guards/app-api-key.guard';
import { ApiSecurity, ApiBearerAuth } from '@nestjs/swagger';


@ApiSecurity('X-API-Key')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminApiKeyGuard)
@Controller('webhook')
export class TradingViewController {
    constructor(
        private tradingViewService: TradingViewService,
        private tradeService: TradeService
    ) {}


   /*  @Post('receive')
    @HttpCode(HttpStatus.OK)
    receiveTradingViewMessage(@Body() message: TradingViewMessage) {
        console.log(message);
        // do something
        return { status: 'success', message: 'Data processed successfully' };
    }

    

    @Post('process-trading-signal')
    async handleTradingSignal(@Body() message: TradingViewMessage) {
        const order = this.tradingViewService.processMessage(message);
        const result = await this.tradeService.executeOrder(order);
        return result;
} */


}
