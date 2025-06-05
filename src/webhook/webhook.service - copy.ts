//src\webhook\webhook.service.ts

import { Injectable } from '@nestjs/common';
import { MongoDBSignalDto } from './dto/mongodb-signal.dto';
import { SignalDto } from './dto/create-signal.dto';

import { TradeSignalService } from '../trade-signal/trade-signal.service';
import { MongodbService } from '../mongodb/mongodb.service';
import { MyGateway } from '../my.gateway'; // 引入 WebSocket 網關
import { Settings, User } from 'src/mongodb/models/users.model';
import { UserDto } from 'src/users/dto/user.dto';

@Injectable()
export class WebhookService {
    constructor(
        private tradeSignalService: TradeSignalService,
        private mongodbService: MongodbService,
        private signalGateway: MyGateway // 注入 SignalGateway
    ) { }

    
    toUserDto(user: User): UserDto {
        return {
          username: user.username,
          email: user.email,
          settings: user.settings,
        };
      }






    convertSignal(signal: SignalDto) {
     
        console.log('Trading Signal DTO 導出為 reorganizedDataIB...')
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
                    symbol: signal.股票 || null,
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
        } catch {
            return null

        }

    }






    async checkFlagAndSendWarningAndTurnOnFlag(email: string, flag: any, message: string, flagKey: string, setValue: any, sendMsg: boolean) {
        //if (flag != true){
        if (sendMsg) {
            if (1 == 1) {
                this.signalGateway.sendSignalToClient({
                    email: email,
                    type: "warning-signal",
                    message: message
                });
            }



        }

        // 使用计算属性名称创建动态键
        const updateObj = {
            identifier: email,
            [flagKey]: setValue // 动态设置 flagKey 的值
        };
        await this.mongodbService.updateSettingsByUsernameOrEmail(updateObj)
    }






    // handle webhook 收到的 signal  //IBTrade
    async handleWebHookSignal(signal: SignalDto): Promise<{ status: string; data: any } | { status: string; data: { message: string } }> {
        //如果無account, 唔做野
        if (!signal.帳戶) { return { status: 'bad signal', data: { message: 'Cannot Process Signal Handling.' } } };

        //如果有account
        if ((signal.帳戶) && (!signal.密碼)) {
            //搵account
            const userSettings = await this.mongodbService.findSettingsByUsernameOrEmail(signal.帳戶)
            //如果搵到account
            if (userSettings) {
                // 如果無trading password
                if (!userSettings.trading_password) {
                    this.checkFlagAndSendWarningAndTurnOnFlag(signal.帳戶, userSettings.flagNoTradingPw, "請先設定交易密碼", "flagNoTradingPw", true, true); //以防止不斷Spam, 只有第一次會發使用者
                    return { status: 'bad signal', data: { message: 'Please Setup Trading Password.' } };
                } else {
                    //如果有交易密碼, 呢度, 個使用者係無密碼既
                    this.checkFlagAndSendWarningAndTurnOnFlag(signal.帳戶, userSettings.flagNoSignalPw, "訊號沒有密碼", "flagNoSignalPw", true, true);
                    return { status: 'bad signal', data: { message: 'Signal Not Auth.' } };
                }} else {
                //無用戶
                return { status: 'bad signal', data: { message: 'Cannot Process Signal Handling.' } };
            }};


        if ((signal.帳戶) && (signal.密碼)) {
            try {
                const userSetting2 = await this.mongodbService.findSettingsByUsernameOrEmail(signal.帳戶)
                console.log('使用者設定:' + this.formatUserSettings(userSetting2))

                if (!userSetting2.trading_password) {
                    //沒有先設定交易密碼
                    this.checkFlagAndSendWarningAndTurnOnFlag(signal.帳戶, userSetting2.flagNoTradingPw, "請先設定交易密碼", "flagNoTradingPw", true, true);
                    return { status: 'bad signal', data: { message: 'Please Setup Trading Password.' } };
                } else {
                    //有先設定交易密碼
                    //對比密碼
                    if (signal.密碼 !== userSetting2.trading_password) {
                        this.checkFlagAndSendWarningAndTurnOnFlag(signal.帳戶, userSetting2.flagWrongPw, "訊號的密碼與你所設定的交易密碼不一致, 不能交易", "flagWrongPw", true, true);
                        return { status: 'bad signal', data: { message: 'Signal Not Auth.' } };

                    } else {
                        //有密碼, 都對得上, 可以交易
                        this.checkFlagAndSendWarningAndTurnOnFlag(signal.帳戶, true, "", "flagNoSignalPw", false, false);// 呢度要取消支flag 因為已經有Password, 會自動取消warning
                        this.checkFlagAndSendWarningAndTurnOnFlag(signal.帳戶, true, "", "flagNoTradingPw", false, false);// 呢度要取消支flag 因為已經有Password, 會自動取消warning
                        this.checkFlagAndSendWarningAndTurnOnFlag(signal.帳戶, true, "", "flagWrongPw", false, false);
                    }};
            } catch (Error) {
                return {status: 'error', data: { message: Error }}
            };


            // 如果上邊的密碼通過, 就開始這裏...
            try {
                const convertedSignal   = this.convertSignal(signal);
                const modifiedSignal    = new MongoDBSignalDto(convertedSignal)

                if (modifiedSignal) {
                    //================================Server Side
                    // 將資料保存到 MongoDB
                    const   mongoDBRes      = await this.mongodbService.createTradeSignalIB(modifiedSignal);
                    const   replyingData    = JSON.parse(JSON.stringify(modifiedSignal));
                    delete  replyingData.account.password
                    const userIdOrEmail     = modifiedSignal.account.account

                    // 將資料通過 WebSocket 發送給客戶端
                    // 使用 Gateway 發送信號給特定用戶
                    this.signalGateway.sendSignalToClient({ // <========這只是提供signal, 話比使用者知有咁既signal, 但未係比order, 因為order要睇埋user Setting
                        email: signal.帳戶,
                        type: "newSignal",
                        message: modifiedSignal
                    });

                    console.log('\n接收到新的信號, 信號已發送到客戶端: ')
                    console.log(replyingData)
                    console.log('\n\n ')
      

                    //const preOrder: any = await this.tradeSignalService.createPreOrder(userIdOrEmail, modifiedSignal)
                    //const contract: any = await this.tradeSignalService.createContract(modifiedSignal)
                    return {
                        status: 'Signal Submitted to WB Server', data: {
                            user: userIdOrEmail,
                            order: replyingData,
                        }
                    };

                    /////////////////=====================================================發送後, 在線下計算============================///////


                    /* const validTypes = ["mkt", "lmt"];
                    const createStopLoss = validTypes.includes(order.stopLossType.toLowerCase());
                    const createTakeProfit = validTypes.includes(order.takeProfitType.toLowerCase()); */


                    /* if (order.totalQuantity > 0){
                        //================================Send order and contract to client 第一張單就點都要落
    
                        const preOrder = {
                            orderDist:"IB",
                            package:{
                                order:order,
                                contract:contract
                            },
                            SLTP:{
                                useSL:  createStopLoss,
                                typeSL: order.stopLossType,
                                SLPerc: order.stopLossPercentage,
                                useTP:  createTakeProfit,
                                typeTP: order.takeProfitType,
                                tpRatio: order.takeProfitRatio
                            }
                            
                        }
                            console.log("Handle DB Signal -> preOrder:")
                            console.log(preOrder)
    
                     
    
        
                          return { status: 'Signal Handled in WB Server', data: preOrder };
    
                    }else{
                        return { status: 'error', data: {message: "Order Quantity = 0"} };
                    } */











                } else {
                    return { status: 'error', data: { message: "Fail to Convert Signal." } };
                }
            } catch (error) {
                // 處理錯誤情況
                return { status: 'error', data: error.message };
            }
        } else {
            return { status: 'error', data: { message: "User ID and Trading Password Required." } };
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
