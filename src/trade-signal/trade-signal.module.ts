import { Module } from '@nestjs/common';

import { TradeSignalService }     from './trade-signal.service';
import { TradeSignalController }  from './trade-signal.controller';

import { MongooseModule } from '@nestjs/mongoose';
import { MongodbModule }  from '../mongodb/mongodb.module';


import { User, UserSchema }                   from '../mongodb/models/users.model';
import { TradeSignal, TradeSignalSchema }     from '../mongodb/models/trade-signal.model';
import { TradeSignalIB, TradeSignalIBSchema } from '../mongodb/models/trade-signal-ib.model';

import { UserSettingsModule }                 from '../user-settings/user-settings.module';
import { IbkrModule }                         from '../ibkr/ibkr.module';


@Module({
  imports:[
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: TradeSignal.name, schema: TradeSignalSchema },
      { name: TradeSignalIB.name, schema: TradeSignalIBSchema },
    ]),
    
    UserSettingsModule,
    MongodbModule,
    IbkrModule
  ],
  controllers: [TradeSignalController],
  providers: [TradeSignalService],
})
export class TradeSignalModule {}
