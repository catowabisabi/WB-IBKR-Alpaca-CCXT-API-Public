import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


import { CreateUsersDto }           from './dto/create-users.dto';
import { CreateTradeSignalDto }     from './dto/create-trade-signal.dto';
import { CreateTradeSignalIBDto }   from './dto/create-trade-signal-ib.dto';

import { UpdateSettingsDto }        from './dto/update-settings.dto';

import { Settings, User, UserDocument }                       from './models/users.model';
import { TradeSignalIB, TradeSignalIBDocument }     from './models/trade-signal-ib.model';
import { TradeSignal,   TradeSignalDocument }       from './models/trade-signal.model';

import * as dotenv from 'dotenv';
import * as fs from 'fs';


@Injectable()
export class MongodbService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(TradeSignal.name) private tradeSignalModel: Model<TradeSignalDocument>,
    @InjectModel(TradeSignalIB.name) private tradeSignalIBModel: Model<TradeSignalIBDocument>,
  
  ) {
    
    /* const envConfig = dotenv.parse(fs.readFileSync('./container/.env'));
    console.log(`重新讀取.env envConfig: ${envConfig}`)
    Object.assign(process.env, envConfig);
    console.log(`重新讀取.env process.env: ${process.env}`)
    console.log(`重新讀取.env process.env.MONGODB_CONNECTION_STRING: ${process.env.MONGODB_CONNECTION_STRING}`) */
  }

  async createUser(createUserDto: CreateUsersDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findSettingsByUsernameOrEmail(identifier: string) {
    await new Promise(resolve => setTimeout(resolve, 100));
    let user: User;
    

    if (identifier.includes('@')) {
      user = await this.userModel.findOne({ email: identifier }).exec();
    } else {
      user = await this.userModel.findOne({ username: identifier }).exec();
    }

    return user?.settings;
  }

  async updateSettingsByUsernameOrEmail(updateSettingsDto: UpdateSettingsDto) {
    if (!updateSettingsDto || !updateSettingsDto.identifier) {
      throw new Error('Identifier is required in updateSettingsDto');
    }

    const { identifier, ...settings } = updateSettingsDto;
    let user: UserDocument;

    if (identifier.includes('@')) {
      user = await this.userModel.findOne({ email: identifier }).exec();
    } else {
      user = await this.userModel.findOne({ username: identifier }).exec();
    }

    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user.settings, settings);
    const newUser = await user.save();
    
    return user.settings;
  }

  

  async createTradeSignal(createTradeSignalDto: CreateTradeSignalDto): Promise<TradeSignal> {
    const createdTradeSignal = new this.tradeSignalModel(createTradeSignalDto);
    console.log(`保存 Tradingview Signal 到 MongoDb...${createdTradeSignal.account.account} at ${createdTradeSignal.order.placeOrderTime}`)
    return createdTradeSignal.save();
  }

  async createTradeSignalIB(createTradeSignalIBDto: CreateTradeSignalIBDto): Promise<TradeSignalIB> {
    console.log('保存 Tradingview Signal 到 MongoDb...')
    const createdTradeSignalIB = new this.tradeSignalIBModel(createTradeSignalIBDto);
    /* console.log(createdTradeSignalIB) */
    return createdTradeSignalIB.save();
  }

  async findTradeSignalsByUsernameOrEmail(
    identifier: string,
    strategy?: string,
    symbol?: string,
    strategyTimeFrame?: string,
    currency?: string,
    startDate?: Date,
    endDate?: Date,
    page = 1,
    limit = 10,
  ): Promise<{ signals: TradeSignalIB[], totalCount: number }> {
    const query: any = { 'account.account': identifier };
  
    if (strategy) {
      query['strategy.strategy'] = { $regex: strategy, $options: 'i' };
    }
    if (symbol) {
      query['order.symbol'] = { $regex: symbol, $options: 'i' };
    }
    if (strategyTimeFrame) {
      query['strategy.strategyTimeFrame'] = strategyTimeFrame;
    }
    if (currency) {
      query['order.currency'] = currency;
    }

    if (startDate && endDate) {
      query['order.placeOrderTime'] = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query['order.placeOrderTime'] = { $gte: startDate };
    } else if (endDate) {
      query['order.placeOrderTime'] = { $lte: endDate };
    }
    
    const signals = await this.tradeSignalIBModel.find(query)
    .sort({ 'order.placeOrderTime': -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
  const totalCount = await this.tradeSignalIBModel.countDocuments(query);

  return { signals, totalCount };
}
}
