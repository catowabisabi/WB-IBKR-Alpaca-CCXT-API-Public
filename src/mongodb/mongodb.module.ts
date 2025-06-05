import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/users.model'
import { TradeSignal, TradeSignalSchema } from './models/trade-signal.model';
import { MongodbService } from './mongodb.service';
import { MongodbController } from './mongodb.controller';
import { TradeSignalIB,   TradeSignalIBSchema }       from './models/trade-signal-ib.model';
import * as dotenv from 'dotenv';
import * as fs from 'fs';


dotenv.config({path: '.env', override: true})



@Module({
  imports: [

    MongooseModule.forRootAsync({
      useFactory: () => {
        
        const envConfig = dotenv.parse(fs.readFileSync('.env'));
        //console.log(`重新讀取.env envConfig: ${JSON.stringify(envConfig)}`);
        //console.log(envConfig);
        Object.assign(process.env, envConfig);
        //console.log(`重新讀取.env process.env: ${JSON.stringify(process.env)}`);
        //console.log(process.env);
        //console.log(`重新讀取.env process.env.MONGODB_CONNECTION_STRING: ${process.env.MONGODB_CONNECTION_STRING}`);

        return {
          uri: process.env.MONGODB_CONNECTION_STRING || envConfig.MONGODB_CONNECTION_STRING,
          // 其他连接选项...
        };
      },
    }),
    //MongooseModule.forRoot(process.env.MONGODB_CONNECTION_STRING),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: TradeSignal.name, schema: TradeSignalSchema },
      { name: TradeSignalIB.name, schema: TradeSignalIBSchema },
    ]),
  ],
  providers: [MongodbService],
  controllers: [MongodbController],
  exports: [MongodbService],   // 確保導出 MongoDbService
})
export class MongodbModule {}

