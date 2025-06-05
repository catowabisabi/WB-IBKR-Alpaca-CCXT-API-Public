//src\webhook\webhook.service.ts

import { Injectable } from '@nestjs/common';
import { MongoDBSignalDto } from './dto/mongodb-signal.dto';
import { SignalDto } from './dto/create-signal.dto';

//import { TradeSignalService } from '../trade-signal/trade-signal.service';
import { MongodbService } from '../mongodb/mongodb.service';
import { MyGateway } from '../my.gateway'; // 引入 WebSocket 網關
import { Settings, User } from 'src/mongodb/models/users.model';
import { UserDto } from 'src/users/dto/user.dto';
import { UserSettingsService } from 'src/user-settings/user-settings.service';
import { AlpacaService } from 'src/alpaca/alpaca.service';
import { config } from '../../config'
import { AlpacaRequestDto } from '../alpaca/dto/alpaca-request.dto';
import { TradeSignalService } from '../trade-signal/trade-signal.service';
import { PreOrderDto } from '../trade-signal/dto/pre-order.dto';
import { TelegramService } from '../telegram/telegram.service';



@Injectable()
export class WebhookService {
  constructor(
    //private tradeSignalService: TradeSignalService,
    private mongodbService: MongodbService,
    private signalGateway: MyGateway, // 注入 SignalGateway
    private userSettingService: UserSettingsService,
    private alpacaService: AlpacaService,
    private tradeSignalService: TradeSignalService,
    private readonly tgbot: TelegramService
  ) { }

  //const cloudWbServerUrl = config.cloudWbServerUrl
  private cloudWbServerUrl = config.localhostUrl

  // 無乜用
  toUserDto(user: User): UserDto {
    return {
      username: user.username,
      email: user.email,
      settings: user.settings,
    }
  };







  // 轉下signal
  convertSignal(signal: SignalDto) {

    console.log('\n\nTrading Signal DTO 導出為 reorganizedDataIB...\n唔打印')
    //console.log(signal)
    const currentDate = new Date();
    currentDate.setMilliseconds(0);
    try {
      const convertSignal = new MongoDBSignalDto({
        account: {
          account: signal.帳戶 ? signal.帳戶 : null,
          password: signal.密碼 || null,
        },
        strategy: {
          strategy: signal.策略 || '無策略',
          strategyTimeFrame: signal.週期 || 'N/A',
        },
        order: {
          symbol: signal.股票.toLocaleUpperCase() || null,
          type: signal.類別 || "US Stock",
          currency: signal.單位 || 'N/A',
          usdPerTrade: signal.每注 || null,
          margin: signal.倍數 || 1,
          exchange: signal.交易所 || 'N/A',
          placeOrderTime: signal.時間 ? new Date(signal.時間) : currentDate, //要先決定有無時間先可以assign time
          tradeAction: signal.交易動作 || 'N/A',
          numberOfContract: signal.交易股數 || null, // 這個可能需要根據你的數據結構進行修改
          triggerPrice: signal.價格 ? Number(parseFloat(signal.價格).toFixed(2)) : null,
          setupOrderType: signal.建倉類型 || '未指定',
          closePositionType: signal.平倉類型 || '未指定',
        },
      })
      return convertSignal
    } catch { return null }
  };



  tg_and_log = (msg: string) => {
    msg = `${msg}\n`
    console.log(`\n\n${msg}`)
    return msg
  }

  removeOrdersAndPositionOfASymbol = async (modifiedSignal, orderIds, symbolToRemove, mode) => {
    await this.removeAlpacaOrders(modifiedSignal, orderIds, mode);
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.closeAlpacaPosition(modifiedSignal, symbolToRemove, mode);
    await new Promise(resolve => setTimeout(resolve, 500));
  }



  // 開warning flag, 宜家無開, 所以如果有waining 會係咁send野
  async checkFlagAndSendWarningAndTurnOnFlag(email: string, flag: any, message: string, flagKey: string, setValue: any, sendMsg: boolean) {
    //if (flag != true){
    if (sendMsg) {
      if (1 == 1) {
        this.signalGateway.sendSignalToClient({
          email: email,
          type: "warning-signal",
          message: message
        })
      }
    };

    // 使用计算属性名称创建动态键
    const updateObj = {
      identifier: email,
      [flagKey]: setValue // 动态设置 flagKey 的值
    };
    await this.mongodbService.updateSettingsByUsernameOrEmail(updateObj)
  };







  // handle webhook 收到的 signal  //IBTrade
  async handleWebHookSignal(signal: SignalDto): Promise<{ status: string; data: any } | { status: string; data: { message: string } }> {
    let responseMsg = "處理訊號過程:\n";

    //如果無account, 唔做野
    if (!signal.帳戶) {
      this.tgSend('沒有帳戶')
      return {
        status: 'bad signal', data: {
          message: 'Cannot Process Signal Handling.'

        }
      }
    };

    //如果有account
    if ((signal.帳戶) && (!signal.密碼)) {
      //搵account
      const userSettings = await this.mongodbService.findSettingsByUsernameOrEmail(signal.帳戶)
      //如果搵到account
      if (userSettings) {
        // 如果無trading password
        if (!userSettings.trading_password) {
          this.tgSend('請先設定交易密碼')
          this.checkFlagAndSendWarningAndTurnOnFlag(signal.帳戶, userSettings.flagNoTradingPw, "請先設定交易密碼", "flagNoTradingPw", true, true); //以防止不斷Spam, 只有第一次會發使用者
          return { status: 'bad signal', data: { message: 'Please Setup Trading Password.' } };
        } else {
          //如果有交易密碼, 呢度, 個使用者係無密碼既
          this.tgSend('訊號沒有密碼')
          this.checkFlagAndSendWarningAndTurnOnFlag(signal.帳戶, userSettings.flagNoSignalPw, "訊號沒有密碼", "flagNoSignalPw", true, true);
          return { status: 'bad signal', data: { message: 'Signal Not Auth.' } };
        }
      } else {
        //無用戶
        this.tgSend('密碼錯誤')
        return { status: 'bad signal', data: { message: 'Cannot Process Signal Handling.' } };
      }
    };


    if ((signal.帳戶) && (signal.密碼)) {
      try {
        const userSetting2 = await this.mongodbService.findSettingsByUsernameOrEmail(signal.帳戶)
        //console.log('使用者設定:' + this.formatUserSettings(userSetting2))

        if (!userSetting2.trading_password) {
          //沒有先設定交易密碼
          this.tgSend('請先設定交易密碼')
          this.checkFlagAndSendWarningAndTurnOnFlag(signal.帳戶, userSetting2.flagNoTradingPw, "請先設定交易密碼", "flagNoTradingPw", true, true);
          return { status: 'bad signal', data: { message: 'Please Setup Trading Password.' } };
        } else {
          //有先設定交易密碼
          //對比密碼
          if (signal.密碼 !== userSetting2.trading_password) {
            this.tgSend('訊號的密碼與你所設定的交易密碼不一致, 不能交易')
            this.checkFlagAndSendWarningAndTurnOnFlag(signal.帳戶, userSetting2.flagWrongPw, "訊號的密碼與你所設定的交易密碼不一致, 不能交易", "flagWrongPw", true, true);
            return { status: 'bad signal', data: { message: 'Signal Not Auth.' } };

          } else {
            //有密碼, 都對得上, 可以交易
            this.checkFlagAndSendWarningAndTurnOnFlag(signal.帳戶, true, "", "flagNoSignalPw", false, false);// 呢度要取消支flag 因為已經有Password, 會自動取消warning
            this.checkFlagAndSendWarningAndTurnOnFlag(signal.帳戶, true, "", "flagNoTradingPw", false, false);// 呢度要取消支flag 因為已經有Password, 會自動取消warning
            this.checkFlagAndSendWarningAndTurnOnFlag(signal.帳戶, true, "", "flagWrongPw", false, false);
            responseMsg += "密碼正確, 開始交易...\n";

          }
        };
      } catch (Error) {
        this.tgSend(`handleWebHookSignal出錯: ${Error}`)
        return { status: 'error', data: { message: Error } }
      };


      // 如果上邊的密碼通過, 就開始這裏...
      try {
        const convertedSignal = this.convertSignal(signal);
        const modifiedSignal = new MongoDBSignalDto(convertedSignal)

        if (modifiedSignal) {
          // 將資料保存到 MongoDB
          const mongoDBRes = await this.mongodbService.createTradeSignalIB(modifiedSignal);
          responseMsg += "已經保存到Database...\n"
          const replyingData = JSON.parse(JSON.stringify(modifiedSignal));
          delete replyingData.account.password
          const userIdOrEmail = modifiedSignal.account.account

          if (modifiedSignal.order.exchange === "IBKR") {
            responseMsg += "使用IB交易\n";
            //================================Server Side
            // 將資料通過 WebSocket 發送給客戶端
            // 使用 Gateway 發送信號給特定用戶
            // <========這只是提供signal, 話比使用者知有咁既signal, 但未係比order, 因為order要睇埋user Setting


            // 呢度send過左去, 就會做買賣, 
            return this.handleSendSignal(signal, "newSignal", modifiedSignal, replyingData,)
          };

          const email = modifiedSignal.account.account;
          const exchange = modifiedSignal.order.exchange;
          const userExchangeApiKeys = await this.fetchKeys(email, exchange);
          responseMsg += `使用${exchange}交易\n`;
          this.tgSend(responseMsg)


          // 呢度係send signal, 功能响下邊搞
          if (modifiedSignal.order.exchange.toLowerCase() === "binance") {
            await this.handleTradeSignalBinance(modifiedSignal, userExchangeApiKeys.binance)
            return this.handleSendSignal(signal, "newSignal", modifiedSignal, replyingData,)

          }

          if (modifiedSignal.order.exchange.toLowerCase() === "alpaca paper") {

            await this.handleTradeSignalAlpaca(modifiedSignal, userExchangeApiKeys.alpacaPaper, 'paper')
            return this.handleSendSignal(signal, "newSignal", modifiedSignal, replyingData,)
          }

          if (modifiedSignal.order.exchange.toLowerCase() === "alpaca live") {
            await this.handleTradeSignalAlpaca(modifiedSignal, userExchangeApiKeys.alpacaLive, 'live')
            return this.handleSendSignal(signal, "newSignal", modifiedSignal, replyingData,)
          }

          if (modifiedSignal.order.exchange.toLowerCase() === "bybit") {
            await this.handleTradeSignalBybit(modifiedSignal, userExchangeApiKeys.bybit)
            return this.handleSendSignal(signal, "newSignal", modifiedSignal, replyingData,)
          }

          if (modifiedSignal.order.exchange.toLowerCase() === "okx") {
            await this.handleTradeSignalOkx(modifiedSignal, userExchangeApiKeys.okx)
            return this.handleSendSignal(signal, "newSignal", modifiedSignal, replyingData,)
          }

        } else {
          return { status: 'error', data: { message: "Fail to Convert Signal." } };
        }


      } catch (error) {
        this.tgSend(`handleWebHookSignal 尾2 出錯: ${error.message}`)
        return { status: 'error', data: error.message }
      };

    } else {
      this.tgSend(`handleWebHookSignal 尾 出錯: User ID 同 Trading Password Required.`)
      return { status: 'error', data: { message: "User ID and Trading Password Required." } };
    }
  }


  tgSend = (msg: string) => {
    this.tgbot.sendMessage(process.env.TG_ID_CAT, msg)
  }



  fetchKeys = async (email: string, exchange: string) => {
    try {
      if (email) {
        const userApiKeys = this.userSettingService.getKeysOfUser(email)
        if (userApiKeys) {
          return userApiKeys
        }
      } else {
        console.log(`使用者的 ${exchange} 密鑰無法提取, 無法交易。`)
        this.tgSend(`使用者的 ${exchange} 密鑰無法提取, 無法交易。`)
        return undefined
      }
    } catch (error) {
      this.tgSend(`獲取密鑰失敗, 使用者的 ${exchange} 密鑰無法提取, 無法交易。錯誤: ${error}`)
      console.error('獲取密鑰失敗:', error);
    }
  };






  async handleTradeSignalBinance(modifiedSignal: MongoDBSignalDto, userExchangeApiKeys: any) {
    console.log('Binance')
    const { key, secret } = userExchangeApiKeys
    //console.log(key)
    //console.log(secret)
    //console.log(modifiedSignal)
  };


  calNewSltpPrice(userSettings, existingPosition, direction) {

    const forceDirection = direction === "buy" ? "sell" : "buy";

    // ================= 新止損
    let restoredTakeProfitPrice = userSettings.useTakeProfitPercentage
      ? (existingPosition.avg_entry_price * (1 - (userSettings.takeProfitPercentage / 100)))
      : userSettings.useTakeProfitRatio
        ? (existingPosition.avg_entry_price * (1 - ((userSettings.stopLossPercentage / 100) * userSettings.takeProfitRatio)))
        : null

    let restoredStopLossPrice = userSettings.useStopLossPercentage
      ? (existingPosition.avg_entry_price * (1 + userSettings.stopLossPercentage / 100))
      : null;


    if (forceDirection === "buy") {
      restoredTakeProfitPrice = userSettings.useTakeProfitPercentage
        ? (existingPosition.avg_entry_price * (1 + (userSettings.takeProfitPercentage / 100)))
        : userSettings.useTakeProfitRatio
          ? (existingPosition.avg_entry_price * (1 + ((userSettings.stopLossPercentage / 100) * userSettings.takeProfitRatio)))
          : null

      restoredStopLossPrice = userSettings.useStopLossPercentage
        ? (existingPosition.avg_entry_price * (1 - userSettings.stopLossPercentage / 100))
        : null;
    }

    const restoredTakeProfitPriceNumber = restoredTakeProfitPrice !== null ? parseFloat(restoredTakeProfitPrice.toFixed(2)) : null;
    const restoredStopLossPriceNumber = restoredStopLossPrice !== null ? parseFloat(restoredStopLossPrice.toFixed(2)) : null;

    return { restoredTakeProfitPriceNumber, restoredStopLossPriceNumber };
  }




  //===================================================================================================================Alpaca  落單
  //===================================================================================================================Alpaca  落單
  //===================================================================================================================Alpaca  落單
  //===================================================================================================================Alpaca  落單

  async cancelAlpacaOrder(modifiedSignal: MongoDBSignalDto, orderId: string) {
    try {
      const body: AlpacaRequestDto = {
        endpoint: '/orders',
        email: modifiedSignal.account.account,
        mode: 'paper', // 或 'live'
        method: 'delete',
        params: {},
        id: orderId,
      };
      await this.alpacaService.postDataAdvance(body);
      this.tgSend(`成功取消 ${modifiedSignal.account.account} Aplaca帳戶的 ${modifiedSignal.order.symbol} 的訂單`)
    } catch (e) {
      console.log(`cancelAlpacaOrder 錯誤: ${e}`)
      this.tgSend(`cancelAlpacaOrder 錯誤: ${e}`)
    }

  }

  async submitAlpacaOrder(
    modifiedSignal: MongoDBSignalDto,
    preOrder: PreOrderDto,
    qty: number,
    mode: string,
    previousStopLossPrice?: number,
    previousTakeProfitPrice?: number,
    forceDirection?: string

  ) {
    await new Promise(resolve => setTimeout(resolve, 3000)); // 等待 3 秒 
    try {
      const { symbol, totalQuantity, action, orderType, orderPrice, stopLossType, stopLossPrice, takeProfitType, takeProfitPrice } = preOrder;
      const side: string = forceDirection ? forceDirection : action;
      const limitPrice: number = orderPrice;


      let orderClass: 'simple' | 'bracket' | 'oco' | 'oto';

      let params: any = {
        symbol: symbol,
        qty: qty,
        side: side,
        type: orderType === "MKT" ? "market" : orderType === "LMT" ? "limit" : null,
        limit_price: orderType === "MKT" ? null : limitPrice,
        time_in_force: 'gtc',
      };

      let msg = ''

      if (stopLossType && takeProfitType) {
        msg = "情況2: 主訂单 + 止損 + 止盈 (oto)"
        orderClass = 'bracket';
        params = {
          ...params,
          order_class: 'bracket',
          take_profit: {
            limit_price: previousTakeProfitPrice ? previousTakeProfitPrice : takeProfitPrice
          },
          stop_loss: {
            stop_price: previousStopLossPrice ? previousStopLossPrice : stopLossPrice
          },
        };

        this.tgSend(`成功取消 ${modifiedSignal.account.account} Aplaca帳戶的 ${modifiedSignal.order.symbol} 的訂單`)

      } else if (stopLossType) {

        msg = "情況3: 主訂单 + 止損 (oto)"
        orderClass = 'oto';
        params = {
          ...params,
          order_class: 'oto',
          stop_loss: {
            stop_price: previousStopLossPrice ? previousStopLossPrice : stopLossPrice
          },
        };

      } else if (takeProfitType) {
        msg = "情況4: 主訂单 + 止盈 (oto)"
        orderClass = 'oto';
        params = {
          ...params,
          order_class: 'oto',
          take_profit: {
            limit_price: previousTakeProfitPrice ? previousTakeProfitPrice : takeProfitPrice
          },
        };


      } else {

        // 情況1: 只有主訂单 (simple)
        orderClass = 'simple';
        msg = "情況1: 只有主訂单 (simple)"
        console.log(msg)
        params = {
          ...params,
          order_class: 'simple'
        };


      }

      console.log(msg)

      const body: AlpacaRequestDto = {
        endpoint: '/orders',
        email: modifiedSignal.account.account,
        mode: mode, // 或 'live'
        method: 'post',
        params,
        id: null,
      };
      const res = await this.alpacaService.postDataAdvance(body);

      const mainOrder = {
        id: res.id,
        時間: res.created_at,
        股票: res.symbol,
        數量: res.qty,
        單類: res.order_class,
        方向: res.side,
        時限: res.time_in_force,
        巿限: res.type,
        入價: res.filled_avg_price,
        限價: res.limit_price,
        停價: res.stop_price,

      }

      const formattedmainOrder = JSON.stringify(mainOrder, null, 2);
      this.tgSend(`Aplaca成功下單: ${modifiedSignal.account.account} 帳戶\n -> ${modifiedSignal.order.symbol} 的主訂單\n\n${msg}\n\n${formattedmainOrder}`)

      if (res.legs) {
        for (const leg of res.legs) {
          const order = {
            id: leg.id,
            時間: leg.created_at,
            股票: leg.symbol,
            數量: leg.qty,
            單類: leg.order_class,
            方向: leg.side,
            時限: leg.time_in_force,
            巿限: leg.type,
            入價: leg.filled_avg_price,
            限價: leg.limit_price,
            停價: leg.stop_price,
          }
          const formattedOrder = JSON.stringify(order, null, 2);
          this.tgSend(`次訂單\n\n${msg}\n\n${formattedOrder}`)
        }
      }


    } catch (error) {

      console.error('Aplaca交易失敗:', error);
      this.tgSend('Aplaca交易失敗:' + error)

    }


  }









  //===================================================================================================================Alpaca  
  //===================================================================================================================Alpaca  
  //===================================================================================================================Alpaca     


  //============================================================================================拎Positions
  async getAlpacaPositions(modifiedSignal: MongoDBSignalDto, mode: string) {
    const body: AlpacaRequestDto = {
      endpoint: '/positions',
      email: modifiedSignal.account.account,
      mode: mode, // 或 'live'
      method: 'get',
      //params: {},
      //id: null,
    };
    const positions = await this.alpacaService.postDataAdvance(body);
    return positions;
  }




  //============================================================================================拎Order
  async getAlpacaOrders(modifiedSignal: MongoDBSignalDto, mode: string) {

    let symbol = modifiedSignal.order.symbol;

    if (symbol.endsWith('USD')) {
      symbol = symbol.slice(0, -3) + '/USD';
    }

    const body: AlpacaRequestDto = {
      endpoint: '/orders',
      email: modifiedSignal.account.account,
      mode: mode, // 或 'live'
      method: 'get',
      params: {
        symbols: [symbol],
        status: 'open',
        limit: 500,
      },
      id: null,
    };
    const orders = await this.alpacaService.postDataAdvance(body);
    return orders;
  }




  //============================================================================================Alpaca平倉
  async closeAlpacaPosition(modifiedSignal: MongoDBSignalDto, symbol: string, mode: string) {

    const body: AlpacaRequestDto = {
      endpoint: '/positions',
      email: modifiedSignal.account.account,
      mode: mode, // 或 'live'
      method: 'delete',
      params: null,
      id: symbol,
    };
    const res = await this.alpacaService.postDataAdvance(body);
    this.tgSend('現有倉位平倉: ' + JSON.stringify(res, null, 2))
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async removeAlpacaOrder(modifiedSignal: MongoDBSignalDto, symbol: string, mode: string) {
    const body: AlpacaRequestDto = {
      endpoint: '/orders',
      email: modifiedSignal.account.account,
      mode: mode, // 或 'live'
      method: 'delete',
      params: null,
      id: symbol,
    };
    const res = await this.alpacaService.postDataAdvance(body);
    console.log(res)
    this.tgSend('取消現有訂單: ' + JSON.stringify(res, null, 2))

  }

  async removeAlpacaOrders(modifiedSignal: MongoDBSignalDto, orderIds: string[], mode: string) {

    const removePromises = orderIds.map(async (orderId) => {
      const res = await this.removeAlpacaOrder(modifiedSignal, orderId, mode);
    });

    await Promise.all(removePromises);

    await new Promise(resolve => setTimeout(resolve, 500));
  }
  //============================================================================================拎單一symbol Positions
  getUserPositionOnSymbol = async (modifiedSignal: MongoDBSignalDto) => {
    console.log(`使用者現有的 ${modifiedSignal.order.symbol} 的倉位: `)
    const body: AlpacaRequestDto = {
      endpoint: '/positions',
      email: modifiedSignal.account.account,
      mode: 'paper',
      method: 'get',
      params: {
        symbols: [modifiedSignal.order.symbol]
      },
      id: null
    };
    const myPositions = await this.alpacaService.postDataAdvance(body);
    console.log(myPositions);

    this.tgSend(`使用者現有的 ${modifiedSignal.order.symbol} 的倉位: ` + JSON.stringify(myPositions, null, 2))

    return myPositions;
  };



  //============================================================================================拎單一symbol Orders
  getUserOrdersOnSymbol = async (modifiedSignal: MongoDBSignalDto) => {
    console.log(`使用者現有的 ${modifiedSignal.order.symbol} 的訂單: `)
    const body: AlpacaRequestDto = {
      endpoint: '/orders',
      email: modifiedSignal.account.account,
      mode: 'paper',

      method: 'get',

      params: {
        symbols: [modifiedSignal.order.symbol],
        nested: true,
      },
      id: null
    };
    const myOrders = await this.alpacaService.postDataAdvance(body);
    console.log(myOrders);
    this.tgSend(`使用者現有的 ${modifiedSignal.order.symbol} 的訂單: ` + JSON.stringify(myOrders, null, 2))
    return myOrders;
  };



  //============================================================================================Alpaca PreOrder 同落trade           
  async handleTradeSignalAlpaca(modifiedSignal: MongoDBSignalDto, userExchangeApiKeys: any, mode: string) {



    //console.log('\n\n======================================================')
    console.log('\n開始進行 Signal 的交易工作 - Alpace Paper:\n')
    let responseMsg = `\n\n======================================================\n開始進行 Signal 的交易工作 - Alpace Paper:\nModifiedSignal: \n${JSON.stringify(modifiedSignal, null, 2)}\n\n`;

    //const {key} = userExchangeApiKeys
    //console.log(key)
    console.log(modifiedSignal)

    try {
      // 步驟 0: 創建 Pre-Order
      const preOrder: PreOrderDto = await this.tradeSignalService.createPreOrder(modifiedSignal.account.account, modifiedSignal);
      console.log('\n\n步驟 0: 創建 Pre-Order')
      console.log(preOrder)
      console.log('\n\n')

      // 步驟 1: 獲取使用者現有的倉位和訂單
      const positions = await this.getAlpacaPositions(modifiedSignal, mode);
      await new Promise(resolve => setTimeout(resolve, 500));
      const orders = await this.getAlpacaOrders(modifiedSignal, mode);// 呢個係一個list 
      await new Promise(resolve => setTimeout(resolve, 500));
      const orderIds = orders.map(order => order.id)
      console.log('\n\n步驟 1: 獲取使用者現有的倉位和訂單')
      //console.log(positions)//呢個ok
      console.log(orders)
      console.log('\n\n')




      // 步驟 2: 檢查現有倉位
      const existingPosition = positions.find(position => position.symbol === preOrder.symbol);
      const existingPositionSide = existingPosition ? (existingPosition.side === "long" ? "buy" : "sell") : null;


      console.log('\n\n步驟 2: 檢查現有倉位')
      console.log(existingPosition)
      console.log(existingPositionSide)
      console.log('\n\n')

      /* 
      debug 
      1. 普通加倉ok 巿價
      2. 
      */

      try {
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //1

        if (preOrder.doTrade) {
          console.log('步驟 3: 檢查doTrade為True');
          responseMsg += this.tg_and_log('密碼正確')

          // 三步, 有倉, 無倉, 有倉一樣, 有倉唔一樣
          // 步驟 3-4: 處理加倉或平倉操作 ==============================呢個ok
          if (existingPosition && existingPositionSide === preOrder.action.toLowerCase()) {

            // 加倉操作
            const newQty = parseFloat(existingPosition.qty) + preOrder.totalQuantity;
            await this.submitAlpacaOrder(modifiedSignal, preOrder, preOrder.totalQuantity, mode);

            responseMsg += this.tg_and_log(`有倉位响手, 方向一樣, 加單, 現有方向為${existingPositionSide}, 訂單方向為${preOrder.action.toLowerCase()} \n
            更新後的倉位為現有倉位: ${parseFloat(existingPosition.qty)} 加 訂單數目: ${preOrder.totalQuantity} =  ${newQty}\n
            己經加倉: 訂單量: ${preOrder.totalQuantity}`)


          } else if (existingPosition && existingPositionSide !== preOrder.action.toLowerCase()) {


            //===================================================================呢度只係拎資料

            const preOrderTotalQuantity = preOrder.totalQuantity;
            const existingPositionQty = parseFloat(existingPosition.qty);
            const newQty = Math.abs(existingPositionQty) - preOrder.totalQuantity;
            const quantityDiff = Math.abs(Math.abs(preOrderTotalQuantity) - Math.abs(existingPositionQty))
            const quantityDiffPercentage = quantityDiff / existingPositionQty * 100; // 百份比
            const userSettings = await this.mongodbService.findSettingsByUsernameOrEmail(modifiedSignal.account.account)
            await new Promise(resolve => setTimeout(resolve, 500));
            const allowedDiffPercentageForClosingPosition = userSettings.allowedDiffPercentageForClosingPosition


            responseMsg += this.tg_and_log(`有倉位响手, 方向唔一樣, 減倉/平倉/反向, 現有方向為${existingPositionSide}, 訂單方向為${preOrder.action.toLowerCase()} \n
            更新後的倉位為現有倉位: ${existingPositionQty} - 訂單數目: ${preOrder.totalQuantity} =  ${newQty}\n
            可平倉價差為:  ${allowedDiffPercentageForClosingPosition}%\n
            使用者設定為:  ${preOrder.useFixAmount ? "使用定額" : preOrder.useFixOrderPercentage ? "使用百份比" : "沒有"}\n訂單價差為: ${quantityDiffPercentage}%`)

            //===================================================================呢度只係拎資料

            console.log('步驟 3-4: 不同方向 - 分流操作')

            // 平倉操作
            if ((preOrderTotalQuantity === existingPositionQty) || ((preOrder.useFixAmount || preOrder.useFixOrderPercentage) && (quantityDiffPercentage <= allowedDiffPercentageForClosingPosition))) {

              await this.removeOrdersAndPositionOfASymbol(modifiedSignal, orderIds, preOrder.symbol, mode); //無倉位了
              responseMsg += this.tg_and_log(`反方向, 訂單量: ${preOrderTotalQuantity},  現有量:${existingPositionQty} , 完全平倉 \n
              完全平倉: ${existingPositionQty}`)


            } else if (preOrder.totalQuantity < Math.abs(parseFloat(existingPosition.qty))) {

              // 部分平倉
              const remainingQty = Math.abs(parseFloat(existingPosition.qty)) - preOrder.totalQuantity;
              await this.removeOrdersAndPositionOfASymbol(modifiedSignal, orderIds, preOrder.symbol, mode); //無倉位了
              responseMsg += this.tg_and_log(`反方向, 訂單量: ${preOrder.totalQuantity} <  現有量:${parseFloat(existingPosition.qty)} , 減倉 , 仲有${remainingQty}\n`)


              const forceDirection = preOrder.action.toLowerCase() === "buy" ? "sell" : "buy";
              const { restoredTakeProfitPriceNumber, restoredStopLossPriceNumber } = this.calNewSltpPrice(userSettings, existingPosition, preOrder.action.toLowerCase());
              await this.submitAlpacaOrder(modifiedSignal, preOrder, remainingQty, mode, restoredTakeProfitPriceNumber, restoredStopLossPriceNumber, forceDirection);// 呢度個stoploss tp係錯既, 因為我唔識計
              //await this.updateAplacaStopLossAndTakeProfit(modifiedSignal, preOrder.symbol, remainingQty, mode);
              //this.tgSend(`減倉: ` + remainingQty)
              responseMsg += this.tg_and_log(`減倉, 仲有咁多係倉度: ${remainingQty}, 新既止損: ${restoredStopLossPriceNumber} , 止Win: ${restoredTakeProfitPriceNumber}, 宜家無做止損個D, 好似, 唔sure, 呢度個stoploss tp係錯既, 因為我唔識計加埋點計`)


            } else {

              console.log('\n\n步驟 3-4: 處理加倉或平倉操作 - 平倉操作 - 完全平倉, 取消所有止損止win, 然後以現價自動再入返止損用現價計算, ')
              await this.removeOrdersAndPositionOfASymbol(modifiedSignal, orderIds, preOrder.symbol, mode);
              const remainingQty = preOrder.totalQuantity - Math.abs(parseFloat(existingPosition.qty));
              await this.submitAlpacaOrder(modifiedSignal, preOrder, remainingQty, mode);

              responseMsg += this.tg_and_log(`反方向, 訂單量: ${preOrder.totalQuantity} >  現有量:${parseFloat(existingPosition.qty)} , 平倉再反手 , 要再買/賣多: ${remainingQty}\n 呢個無做止損因為未做`)

            }
          } else {

            

            // 建立新倉位
            console.log(preOrder)
            await this.removeAlpacaOrders(modifiedSignal, orderIds, mode);
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.submitAlpacaOrder(
              modifiedSignal, preOrder, preOrder.totalQuantity, mode);
            //this.tgSend(`新倉: ` + preOrder.totalQuantity)
            responseMsg += this.tg_and_log(`無倉位响手, 建立新倉位: \n
            股票: ${preOrder.symbol} \n
            數目: ${preOrder.totalQuantity} \n
            方向: ${preOrder.action} \n
            交所: ${preOrder.exchange} \n
            拎價: ${preOrder.takeProfitPrice} \n
            停價: ${preOrder.stopLossPrice} \n
            固金: ${preOrder.useFixAmount} \n
            固百: ${preOrder.useFixOrderPercentage} \n`)

          }

          return () => {

            responseMsg += this.tg_and_log('交易完成');
            this.tgSend(responseMsg)
          }

        } else {
          responseMsg += this.tg_and_log('密碼不匹配,不執行交易');
          this.tgSend(responseMsg);
        }
      } catch (e) {
        responseMsg += this.tg_and_log(`Alpaca 交易錯誤1: ${e}`)
        this.tgSend(responseMsg);
      }





      // 步驟 5: 處理現有訂單 // 唔可以取消現有訂單, 唔好痴線岩岩落單, 呢個keep住用黎第日參考用
      /*  for (const order of orders) {
         if (order.symbol === preOrder.symbol && order.side !== preOrder.action) {
           await this.cancelAlpacaOrder(modifiedSignal, order.id);
         }
       }
  */


    } catch (error) {
      responseMsg += this.tg_and_log(`Alpaca 交易錯誤2: ${error}`)
      this.tgSend(responseMsg)
      // 處理錯誤
    }
  }

  // 





  //===================================================================================================================Alpaca  
  //===================================================================================================================Alpaca  
  //===================================================================================================================Alpaca   


























  async handleTradeSignalOkx(modifiedSignal: MongoDBSignalDto, userExchangeApiKeys: any) {
    console.log('Okx')
    const { key } = userExchangeApiKeys
    //console.log(key)
    //console.log(modifiedSignal)
  };

  async handleTradeSignalBybit(modifiedSignal: MongoDBSignalDto, userExchangeApiKeys: any) {
    console.log('Bybit')
    const { key } = userExchangeApiKeys
    // console.log(key)
    //console.log(modifiedSignal)
  };











  //===================================================================================================發送訊號
  async handleSendSignal(signal, type: string, modifiedSignal: MongoDBSignalDto, replyingData,) {
    this.signalGateway.sendSignalToClient({ // <========這只是提供signal, 話比使用者知有咁既signal, 但未係比order, 因為order要睇埋user Setting
      email: signal.帳戶,
      type: type,
      message: modifiedSignal
    });

    console.log(modifiedSignal.order.exchange)
    console.log(`\n接收到新的交易信號, 發送目標: 使用者${modifiedSignal.order.exchange}中轉器。 信號已發送到客戶端: `)
    console.log(replyingData)
    console.log('\n\n ')

    return {
      status: 'Signal Submitted to WB Server', data: {
        user: signal.帳戶,
        order: replyingData,
      }
    }
  }






  formatUserSettings(userSettings: any): string {
    return `
      使用固定金額：　　　　　　${userSettings.useFixAmount ? '是' : '否'}
      固定金額價格：　　　　　　${userSettings.fixAmountPrice}

      使用固定訂單百分比：　　　${userSettings.useFixOrderPercentage ? '是' : '否'}
      固定訂單百分比：　　　　　${userSettings.fixOrderPercentage}%

      使用保證金：　　　　　　　${userSettings.useMargin ? '是' : '否'}
      保證金比率：　　　　　　　${userSettings.marginRatio}%

      訂單類型：　　　　　　　　${userSettings.orderType ? this.getOrderTypeInChinese(userSettings.orderType) : '無'}
      止損類型：　　　　　　　　${userSettings.stopType ? this.getOrderTypeInChinese(userSettings.stopType) : '無'}
      止盈類型：　　　　　　　　${userSettings.profitType ? this.getOrderTypeInChinese(userSettings.profitType) : '無'}
      
      使用止損百分比：　　　　　${userSettings.useStopLossPercentage ? '是' : '否'}
      止損百分比：　　　　　　　${userSettings.stopLossPercentage}%

      使用止盈百分比：　　　　　${userSettings.useTakeProfitPercentage ? '是' : '否'}
      止盈百分比：　　　　　　　${userSettings.takeProfitPercentage}%
      
      使用止盈比率：　　　　　　${userSettings.useTakeProfitRatio ? '是' : '否'}
      止盈比率：　　　　　　　　${userSettings.takeProfitRatio}
      
      使用追蹤趨勢訂單：　　　　${userSettings.useFollowTrendOrder ? '是' : '否'}
      使用隔離交易模式：　　　　${userSettings.useIsolatedTradingMode ? '是' : '否'}
      
      交易密碼：　　　　　　　　${userSettings.trading_password}
      
      IB網關或TWS端口：　　　　　${userSettings.ib_gateway_or_tws_port}
      啟用IB API：　　　　　　　${userSettings.ib_api_enable ? '是' : '否'}
      Ngrok TCP 連結：　　　　　${userSettings.ngrok_tcp_link}
      Ngrok TCP 端口：　　　　　${userSettings.ngrok_tcp_port}
      
      ID：　　　　　　　　　　　${userSettings._id}
      
      缺少交易訊號密碼標誌：　　${userSettings.flagNoSignalPw ? '是' : '否'}
      缺少交易密碼標誌：　　　　${userSettings.flagNoTradingPw ? '是' : '否'}
      錯誤密碼標誌：　　　　　　${userSettings.flagWrongPw ? '是' : '否'}
        `;
  }

  getOrderTypeInChinese(orderType: string): string {
    switch (orderType) {
      case 'MKT':
        return '市價單';
      case 'LMT':
        return '限價單';
      case 'STP':
        return '止損單';
      default:
        return '未知';
    }
  }
}
