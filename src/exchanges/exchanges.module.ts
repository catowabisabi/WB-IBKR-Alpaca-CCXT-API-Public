// src/exchanges/exchanges.module.ts
import { Module } from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { ExchangesController } from './exchanges.controller';


@Module({
    
    controllers: [ExchangesController],
    providers: [ExchangesService],
    exports: [ExchangesService]  // Export ExchangesService if it needs to be used elsewhere
})
export class ExchangesModule {}