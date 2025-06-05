import { Injectable } from '@nestjs/common';
import { CreateTradeSignalDto } from './dto/create-trade-signal.dto';
import { UpdateTradeSignalDto } from './dto/update-trade-signal.dto';
import { plainToInstance } from 'class-transformer';
import { Contract, Order, OrderAction, OrderType, SecType, StopLimitOrder, TimeInForce } from '@stoqey/ib';
import { MongodbService } from '../mongodb/mongodb.service';
import { UserSettingsService } from '../user-settings/user-settings.service';
import { IbkrService } from '../ibkr/ibkr.service';
import { MongoDBSignalDto } from 'src/webhook/dto/mongodb-signal.dto';




@Injectable()
export class TradeSignalService {

  constructor(
    private mongodbService: MongodbService,
    private userSettingsService: UserSettingsService,
    private ibkrService: IbkrService,

  ) { }

  print(intro: string, _variable: any) {
    console.log(`\n\n======================================================\n${intro} : `)
    console.log(_variable)
    console.log(`\n\n======================================================\n\n`)
  }

  create(createTradeSignalDto: CreateTradeSignalDto) {
    console.log('建立一個Trade Signal DTO...')
    console.log(createTradeSignalDto);
    return { message: 'Trade data received successfully', data: createTradeSignalDto };
  }

  handleTradingviewSignal(createTradeSignalDto: any) {
    console.log('Trading Signal DTO 導出為 reorganizedData...')
    const reorganizedData = {
      account: {
        tradingRobot: createTradeSignalDto['機器人'],
        account: createTradeSignalDto['帳戶'],
        exchange: createTradeSignalDto['交易所'],
      },
      auth: {
        AID: createTradeSignalDto.aid,
        apiSec: createTradeSignalDto.api_sec,
      },
      strategy: {
        strategy: createTradeSignalDto['策略'],
        strategyInfo: createTradeSignalDto['注解'],
        strategyTimeFrame: createTradeSignalDto['週期'],
      },
      order: {
        symbol: createTradeSignalDto['股票'],
        type: createTradeSignalDto['類別'],
        usdPerTrade: createTradeSignalDto['每注'],
        margin: createTradeSignalDto['倍數'],
        TdMode: createTradeSignalDto.td_mode,
        OrderType: createTradeSignalDto.ord_type,
        stopLossTakePorfitType: createTradeSignalDto.sltp_type,
        placeOrderTime: createTradeSignalDto['時間1'] || createTradeSignalDto['時間2'],
        triggerPrice: createTradeSignalDto['交易入場出場價'],
        numberOfContract: createTradeSignalDto['交易合約量'],
        tradeAction: createTradeSignalDto['交易動作'],
      },
      positionState: {
        positionNow: createTradeSignalDto['當前倉位狀態'],
        priceOfPositionNow: createTradeSignalDto['當前倉位價格'],
        positiionBefore: createTradeSignalDto['之前倉位狀態'],
        priceOfPositionBefore: createTradeSignalDto['之前倉位價格'],
      },
    };
    // 將重組後的數據轉換為CreateTradeSignalDto類的實例
    const tradeSignalDto = plainToInstance(CreateTradeSignalDto, reorganizedData, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true  // 確保基於類型的轉換被啟用
    });

    return reorganizedData;
  }

  // 簡化後的signal
  handleTradingviewSignalIB(tradingViewSignal: any) {
    console.log('Trading Signal DTO 導出為 reorganizedDataIB...')
    //console.log(tradingViewSignal)

    const reorganizedSignalData: MongoDBSignalDto = {
      account: {
        account: tradingViewSignal['帳戶'],
        password: tradingViewSignal['密碼'],
      },
      strategy: {
        strategy: tradingViewSignal['策略'],
        strategyTimeFrame: tradingViewSignal['週期'],
      },
      order: {
        symbol: tradingViewSignal['股票'],
        type: tradingViewSignal['類別'],
        currency: tradingViewSignal['單位'],
        usdPerTrade: tradingViewSignal['每注'],
        margin: tradingViewSignal['倍數'],
        exchange: tradingViewSignal['交易所'],
        placeOrderTime: tradingViewSignal['時間'],

        tradeAction: tradingViewSignal['交易動作'],
        numberOfContract: tradingViewSignal['交易股數'],
        triggerPrice: tradingViewSignal['價格'],
        setupOrderType: tradingViewSignal['建倉類型'],
        closePositionType: tradingViewSignal['平倉類型'],
      },
    };



    this.print("Tradingview Signal", reorganizedSignalData)


    return reorganizedSignalData;
  }

  // IB和普通美股的計算  , 這個可以用, 但我在最後重寫
  async createOrder(userIdOrEmail: string, reorganizedSignalData: MongoDBSignalDto): Promise<Order> {
    console.log('\nreorganizedData 導出 IB用的 普通下單用 ORDER\n\n')
    const userSettings = await this.userSettingsService.findAllSettingsOfUser(userIdOrEmail)
    
    
    // 第一件事要先決定要用巿價單定限價單, 如果無價一定係巿價單
    let haveTriggerPrice : boolean
    let finalOrderType : string | null
    if ((reorganizedSignalData.order.triggerPrice == 0) || (reorganizedSignalData.order.triggerPrice == null)){
      haveTriggerPrice = false;
    }else{
    haveTriggerPrice = true;
      
    }
    // signal ordertype
    const signalOrderType = 
    reorganizedSignalData.order.setupOrderType === '巿價單' ? "MKT" :
    reorganizedSignalData.order.setupOrderType === '限價單' ? "LMT" :
    null; // 對於「不指定」的情況

    //setting ordertype
    const settingsOrderType = userSettings.orderType
    
  //this.print("使用者設定", userSetting).
    /* console.log('reorganizedSignalData')
    console.log(reorganizedSignalData)
    this.print("orderType", signalOrderType)
    this.print('setting orderType: ', userSettings) */

    const notUserAuth = reorganizedSignalData.account.password !== userSettings.trading_password;

    const usdPerTrade = reorganizedSignalData.order.usdPerTrade?reorganizedSignalData.order.usdPerTrade: 
    userSettings.fixAmountPrice? userSettings.fixAmountPrice:null;

    const stopLossPrice = parseFloat(((reorganizedSignalData.order.triggerPrice * (1 - (userSettings.stopLossPercentage / 100))).toFixed(2)));
    const fixAmountToQuantity = Math.floor((usdPerTrade ? usdPerTrade : userSettings.fixAmountPrice / reorganizedSignalData.order.triggerPrice));
    const useFixOrderPercentage = userSettings.useFixOrderPercentage;// 呢個要去ib拎profile
    const accountSummary = await this.ibkrService.getAccountSummary();
    const accountKey = Object.keys(accountSummary)[0]; // Assuming there's only one account
    const myTotalMoneyInIB = parseFloat(accountSummary[accountKey].TotalCashValue.value);

    const fixPercentageQuantity = Math.floor(((myTotalMoneyInIB * (userSettings.fixOrderPercentage / 100)) / 8) / reorganizedSignalData.order.triggerPrice);
    const settingOrderType = userSettings.orderType;//can be null
    const takeProfitPrice = parseFloat((reorganizedSignalData.order.triggerPrice * (1 + (userSettings.stopLossPercentage / 100 * userSettings.takeProfitRatio))).toFixed(2));

    
    const signalClosePositionType = reorganizedSignalData.order.closePositionType === "限價單" ? OrderType.LMT : reorganizedSignalData.order.closePositionType === "巿價單" ? OrderType.MKT : undefined

    finalOrderType = reorganizedSignalData.order.setupOrderType === "限價單" ? OrderType.LMT : reorganizedSignalData.order.setupOrderType === "巿價單" ? OrderType.MKT : undefined


    /*  console.log('\n\ncreateOrder-----------\n')
     console.log(userSetting)
     console.log(fixPercentageQuantity)
     console.log(myTotalMoneyInIB)
     console.log('\n\ncreateOrder-----------END\n') */

    const order = {
      orderForExchange: "IBKR",
      action: reorganizedSignalData.order.tradeAction as OrderAction,
      orderType: signalOrderType ? signalOrderType as OrderType  : settingOrderType as OrderType  ? settingOrderType as OrderType : signalOrderType as OrderType,

      lmtPrice: signalOrderType ? reorganizedSignalData.order.triggerPrice : signalOrderType === OrderType.LMT ? reorganizedSignalData.order.triggerPrice : 1,  // 使用 lmtPrice 對於限價單


      totalQuantity:
        notUserAuth ? 0 :
        reorganizedSignalData.order.usdPerTrade ? reorganizedSignalData.order.usdPerTrade :
            userSettings.useFixAmount ? fixAmountToQuantity :
              useFixOrderPercentage ? fixPercentageQuantity : reorganizedSignalData.order.numberOfContract ? reorganizedSignalData.order.numberOfContract : 0,


      stopLossType: signalOrderType ? signalOrderType : userSettings.useStopLossPercentage ? userSettings.stopType : undefined,
      auxPrice: signalOrderType ? stopLossPrice : userSettings.useStopLossPercentage ? stopLossPrice : undefined,   // 使用 auxPrice 對於停止價單

      takeProfitType: signalClosePositionType ? signalClosePositionType : userSettings.useTakeProfitRatio ? userSettings.profitType : undefined,
      takeProfitPrice: signalClosePositionType ? takeProfitPrice : userSettings.useTakeProfitRatio ? takeProfitPrice : undefined,


      followTrend: userSettings.useFollowTrendOrder,
      transmit: true,
    };

    
    //console.log(order)
    const _order: Order = order
    this.print("依使用者設定計算好的 Order 內容", _order)
    return _order
  }

  // 基本買賣的Contract
  async createContract(reorganizedData: any) {
    console.log('reorganizedData 建立基本買賣的IB Contract')
    const symbol = reorganizedData.order.symbol;

    //console.log(`createContract, symbol: ${symbol}`);

    const contractDetails = await this.ibkrService.getContractDetails(symbol)
    const secType = contractDetails[0].secType
    const currency = contractDetails[0].currency
    const exhange = contractDetails[0].exchange

    const contract: Contract = {
      symbol: symbol,
      secType: secType as SecType,
      currency: currency,
      exchange: exhange
    };
    const _contract: Contract = contract
    this.print("在IB返回的 Contract 內容", _contract)


    return _contract
  }

  // 未完成的handleTrade
  async handleTrade(userIdOrEmail:string,createTradeSignalDto: any) {
    console.log('未完成的handleTrade, For CCXT')
    /* const reorganizedData = this.handleTradingviewSignal(createTradeSignalDto)
    //save reorganizedData to Mongodb
    //console.log(reorganizedData)
    const order: Order = await this.createOrder(userIdOrEmail, reorganizedData)
    console.log(order)
    const contract: Contract = await this.createContract(reorganizedData)
    console.log(`handleTrade, contract: ${contract}`);
 */


    //checksettings

    //trade




  }





  //簡化後的handle Trade for IBs //呢個要响 client做
  async handleTradeIB(tradingviewSignal: any) {
    try{

    const reorganizedData:MongoDBSignalDto = this.handleTradingviewSignalIB(tradingviewSignal)
    const mongoDBRes = await this.mongodbService.createTradeSignalIB(reorganizedData);
    const userIdOrEmail = reorganizedData.account.account
    const order: any = await this.createOrder(userIdOrEmail, reorganizedData) //呢個唔係真order


    const contract: any = await this.createContract(reorganizedData)
    const userSetting = await this.userSettingsService.findAllSettingsOfUser(userIdOrEmail)
    //checksettings 已經响個邊check左
    //trade


    // 如果是buy order , 建立一張買單

    // double check signal  SIGNAL > SETTING SIGNAL行先 // 呢個check唔到因為呢個api拎唔到price
    // 拎巿價, 如果LMT大過巿價, 使用巿價作為LMT
    // 交易所, 用SMART
    // check下單位, 係咪同contract個單位一樣
    // 1) 如果有每注幾錢, 就跟
    // 2) 如果每注無, 就睇SETTING, 睇下SETTING有無 使用固定金額交易
    // 1 或 2, 改變 totalQuantity
    // 3) 交易股數, 每注>SETTING > 百份比 > 交易股數 > 0
    // 4) 下單類別, signal最大, 然後係setting, 如果都無, 用巿價作為限價買入

    //const orderID = parseFloat(await this.ibkrService.placeOrder2(order,contract))
    //this.print("交易完成, 返回", orderID)
    const firstOrderId = parseFloat(await this.ibkrService.placeOrder2(order, contract))

    const validTypes = ["mkt", "lmt"];
    const createStopLoss = validTypes.includes(order.stopLossType.toLowerCase());
    const createTakeProfit = validTypes.includes(order.takeProfitType.toLowerCase());

    if (createStopLoss) {
      const stopLossOrderId = await this.ibkrService.submitStopLimitOrder(contract, order)
    };

    if (createTakeProfit) {
      const takeProfitId = await this.ibkrService.submitTakeProfitOrder(contract, order)
    };

    const flipCondition = true;//當有得反手
    const removeAllPositionCondition = true;//平倉
    //加倉
    //賣既話要計winrate

  }catch(error) {
    console.log(`提交tradingview to IB 錯誤-> handleTradeIB error: \n${error}\n\n`)
  }
  }

  async handleTradeIBSetupStopLossOrder(order: Order, contract: Contract) {
    console.log('\n提交止損單:')
    console.log(`${order}`)
    console.log(`${contract}`)
    
    const tradeDetails = await this.ibkrService.placeOrder2(order, contract)
    return tradeDetails

    //const tradeDetails = await this.ibkrService.placeOrder2(order,contract)

  }

  async createPreOrder(userIdOrEmail: string, reorganizedSignalData: MongoDBSignalDto): Promise<any> {
    const { account, order } = reorganizedSignalData;
    const userSettings = await this.userSettingsService.findAllSettingsOfUser(userIdOrEmail);
    
  
    // 檢查交易密碼是否匹配
    let doTrade = account.password === userSettings.trading_password;
  
    // 確定下單類別
    const orderType = this.getOrderType(order.setupOrderType, userSettings.orderType);
  
    // 計算止損價格和數量
    const {  useFixAmount, useFixOrderPercentage, quantity } = await this.calculateQuantity(order, userSettings, this.ibkrService, reorganizedSignalData.order.type);

    const { stopLossType, stopLossPrice } = this.getStopLossTypeAndPrice(order, userSettings, order.tradeAction)
  
    // 確定平倉類別和止盈價格
    const { takeProfitType, takeProfitPrice } = this.getTakeProfitTypeAndPrice(order, userSettings, order.tradeAction);

    
  
    const preOrder = {
      exchange: "IBKR",
      symbol: order.symbol,
      useFixAmount : useFixAmount,
      useFixOrderPercentage: useFixOrderPercentage,

      doTrade:doTrade,
      action: order.tradeAction as OrderAction,
      orderType: orderType,
      orderPrice: order.triggerPrice,
      totalQuantity: quantity,
      stopLossType: stopLossType,
      stopLossPrice: stopLossPrice,
      takeProfitType: takeProfitType,
      takeProfitPrice: takeProfitPrice,
      followTrend: userSettings.useFollowTrendOrder,
      transmit: true,
    };
  
    this.print("依使用者設定計算好的 Pre-Order 內容", "唔打印" )//preOrder);
    
    return preOrder;
  }
  
  // 獲取下單類別
   getOrderType(signalOrderType: string | undefined | null, settingsOrderType: string | null): OrderType {
    if (signalOrderType === "限價單") return OrderType.LMT;
    if (signalOrderType === "巿價單") return OrderType.MKT;
    if (settingsOrderType) return settingsOrderType as OrderType;
    return OrderType.MKT; // 默認市價單
  }
  
  // 計算止損價格和數量
  // 計算止損價格和數量
async calculateQuantity(order: any, userSettings: any, ibkrService: any, type: string) {
  let quantity: number;

  let useFixAmount : boolean = false;
  let useFixOrderPercentage : boolean = false;

  if (order.usdPerTrade) {
      quantity = type === "Crypto" ? (order.usdPerTrade / order.triggerPrice) : Math.floor(order.usdPerTrade / order.triggerPrice);
  } else if (userSettings.useFixAmount) {
      useFixAmount = true;
      quantity = type === "Crypto" ? (userSettings.fixAmountPrice / order.triggerPrice) : Math.floor(userSettings.fixAmountPrice / order.triggerPrice);
  } else if (userSettings.useFixOrderPercentage) {
      useFixOrderPercentage = true;
      try {
          const accountSummary = await ibkrService.getAccountSummary();
          const accountKey = Object.keys(accountSummary)[0];
          const totalCashValue = parseFloat(accountSummary[accountKey].TotalCashValue.value);
          quantity = type === "Crypto" ? ((totalCashValue * (userSettings.fixOrderPercentage / 100)) / 8) / order.triggerPrice : Math.floor(((totalCashValue * (userSettings.fixOrderPercentage / 100)) / 8) / order.triggerPrice);
      } catch (error) {
          console.error("Failed to get account summary:", error);
          quantity = order.numberOfContract || 0;
      }
  } else {
      quantity = order.numberOfContract || 0;
  }

  // 如果是加密貨幣,保留小數點後8位
  if (type === "Crypto") {
      quantity = parseFloat(quantity.toFixed(8));
  }

  return { useFixAmount, useFixOrderPercentage, quantity };
}
  
  // 獲取止盈類別和止盈價格
getTakeProfitTypeAndPrice(order: any, userSettings: any, direction: string) {
  const takeProfitType = this.getClosePositionType(order.closePositionType, userSettings.profitType);
  const takeProfitPrice = this.calculateTakeProfitPrice(order.triggerPrice, userSettings.stopLossPercentage, userSettings.takeProfitRatio, direction, takeProfitType);

  return { takeProfitType, takeProfitPrice };
}

// 獲取止損類別和止損價格
getStopLossTypeAndPrice(order: any, userSettings: any, direction: any) {
  const stopLossType = this.getClosePositionType(order.closePositionType, userSettings.stopType);
  const stopLossPrice = this.calculateStopLossPrice(order.triggerPrice, userSettings.stopLossPercentage, direction, stopLossType);

  return { stopLossType, stopLossPrice };
}
// 獲取平倉類別
getClosePositionType(closePositionType: string | undefined, settingsType: string | undefined) {
  if (closePositionType === "限價單") return OrderType.LMT;
  if (closePositionType === "巿價單") return OrderType.MKT;
  if (settingsType) return settingsType as OrderType;
  return undefined;
}
// 計算止損價格
calculateStopLossPrice(triggerPrice: number, stopLossPercentage: number, direction: string, stopLossType: OrderType | undefined) {
  if (!stopLossType) return undefined;

  const multiplier = direction.toUpperCase() === "BUY" ? 1 - stopLossPercentage / 100 : 1 + stopLossPercentage / 100;
  return parseFloat((triggerPrice * multiplier).toFixed(2));
}
// 計算止盈價格
calculateTakeProfitPrice(triggerPrice: number, stopLossPercentage: number, takeProfitRatio: number, direction: string, takeProfitType: OrderType | undefined) {
  if (!takeProfitType) return undefined;

  const multiplier = direction.toUpperCase() === "BUY" ? 1 + stopLossPercentage / 100 * takeProfitRatio : 1 - stopLossPercentage / 100 * takeProfitRatio;
  return parseFloat((triggerPrice * multiplier).toFixed(2));
}
}
