import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { TradeSignalService } from 'src/trade-signal/trade-signal.service';
import { MongodbService } from '../mongodb/mongodb.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema }                   from '../mongodb/models/users.model';
import { TradeSignal, TradeSignalSchema }     from '../mongodb/models/trade-signal.model';
import { TradeSignalIB, TradeSignalIBSchema } from '../mongodb/models/trade-signal-ib.model';
import { UserSettingsModule } from '../user-settings/user-settings.module';
import { MongodbModule } from '../mongodb/mongodb.module';
import { IbkrModule } from '../ibkr/ibkr.module';
import { MyGateway } from '../my.gateway';
import { AlpacaService } from '../alpaca/alpaca.service';
import { TelegramService } from '../telegram/telegram.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: TradeSignal.name, schema: TradeSignalSchema },
      { name: TradeSignalIB.name, schema: TradeSignalIBSchema },
    ]),
    
    UserSettingsModule,
    MongodbModule,
    IbkrModule,
    TelegramModule,
    

    
  ],
  controllers: [WebhookController],
  providers: [WebhookService, TradeSignalService, MongodbService, MyGateway, AlpacaService],
})
export class WebhookModule {}
