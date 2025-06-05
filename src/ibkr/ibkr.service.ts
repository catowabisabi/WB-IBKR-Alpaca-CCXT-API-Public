import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IBApi, Contract, Order, OrderAction, OrderType, SecType, MarketDataType, BarSizeSetting, WhatToShow, ExecutionFilter, EventName, IBApiNext, TimeInForce } from '@stoqey/ib';
import { Execution, ExecutionDetail } from '@stoqey/ib';
import { CommissionReport } from '@stoqey/ib';
import { TagValue } from '@stoqey/ib';
import { MyOpenOrder } from "./ibkr.interface"
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateClosePositionDto } from './dto/create-close-position.dto';
import { Position } from './ibkr.interface';
import { List } from 'ccxt/js/src/base/types';
import { MongodbService } from 'src/mongodb/mongodb.service';
import { IbkrConnectionException } from './ibkr-connection.exception';

// 定義常量
const TIMEOUT = 30000;

@Injectable()
export class IbkrService {

    //=================================設定VAR
    private client: IBApi;
    
    private nextOrderId: number | null = null;  // 用於存儲下一個有效的訂單ID
    private readyToTrade = false;  // 用于标志是否准备好交易
    private apiReady = false;
    private mongodbService: MongodbService;
  
    //=================================設定VAR

  //建立client, listener, try connect
  constructor() {
    try {
      this.client = new IBApi({port: parseInt(process.env.IBKR_PORT || '7497')}); //4002
      /* this.client = new IBApi({
        host: '0.tcp.ngrok.io',   // ngrok 提供的公共地址 TCP not HTTP
        port: 17727,              // ngrok 提供的公共端口，替換為實際的端口
        //clientId: 1               // 用戶端ID，可以是任何非負整數，除非有多個客戶端同時連接，則需要不同的ID
      }); */

      /* this.client2 = new IBApiNext({
        port: parseInt(process.env.IBKR_PORT || '7497'),//4002
      }); */
      this.setupEventListeners();
      this.connect();
      this.apiReady = true

    } catch (error) {
      console.error('IBKR API 連線不能:', error);
      this.apiReady = false;
      
      
    }
  }
  private async getAccountId0(): Promise<string> {
    const maxRetries = 3;
    const retryDelay = 5000; // 5 seconds

    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.connect();
        const accountSummary = await this.getAccountSummary();
        return Object.keys(accountSummary)[0];
      } catch (error) {
        if (i === maxRetries - 1) {
          throw new IbkrConnectionException('Failed to get account ID after multiple retries');
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

   async getAccountId(): Promise< string> {
    await this.connect();
  
    return new Promise((resolve, reject) => {
      const handleManagedAccounts = (managedAccounts: string) => {
        this.client.removeListener(EventName.managedAccounts, handleManagedAccounts);
        this.client.removeListener(EventName.error, handleError);
  
        const accounts = managedAccounts.split(',');
        
        const accountId: string = accounts[0]
        resolve(accountId);
        return accountId
      };




  
      const handleError = (error: Error) => {
        this.client.removeListener(EventName.managedAccounts, handleManagedAccounts);
        this.client.removeListener(EventName.error, handleError);
        reject(error);
      };
  
      this.client.once(EventName.managedAccounts, handleManagedAccounts);
      this.client.once(EventName.error, handleError);
  
      this.client.reqManagedAccts();
    });
  }

  

  



  print (intro: string, _variable: any){
    console.log(`\n======================================================\n${intro} : `)
    console.log(_variable)
    console.log(`\n======================================================\n\n`)
  }

  private async ensureConnected(): Promise<void> {
    if (!this.client.isConnected) {
        this.client.connect();
        await new Promise((resolve, reject) => {
            this.client.once(EventName.connected, resolve);
            this.client.once(EventName.error, reject);
        });
    }
}

  // 搞好listeners先, 但呢度有可能有D無用, production 要check下
  private setupEventListeners() {
    try {
      //ID
      this.client.on(EventName.nextValidId, (orderId: number) => {
        this.nextOrderId = orderId;
        this.readyToTrade = true;
        //console.log(`Received next valid order ID: ${orderId}`);
      });
      
      //Error
      this.client.on(EventName.error, (error, code, reqId) => {
        console.error(`IBKR API 連接出現錯誤: ${error} 錯誤代碼為: ${code} Request ID: ${reqId}`);
       
      });

      //Open Order
      /* this.client.once(EventName.openOrder, (orderId, contract, order, orderState) => {
        console.log(`Open Order: OrderId: ${orderId}, Symbol: ${contract.symbol}, Action: ${order.action}, OrderType: ${order.orderType}, TotalQty: ${order.totalQuantity}, LmtPrice: ${order.lmtPrice}, Status: ${orderState.status}`);
      }); */

      this.client.on(EventName.openOrderEnd, () => {
        console.log("All open orders have been received.");
      });

      //Complete Order
      this.client.on(EventName.completedOrder, (contract, order, orderState) => {
        console.log(`Completed Order ID: ${order.orderId}, Contract: ${contract.symbol}, ExecID: ${orderState}`);
      });

      this.client.on(EventName.completedOrdersEnd, () => {
        console.log("All completed orders have been received.");
      });
    } catch (error) {
      // 如果以上有Error, 姐係連唔到線之類
      console.error('Failed to initialize IBKR API:', error);
      throw new IbkrConnectionException('Failed to initialize IBKR API:'+ error)
    }
  }

  // 1) 建立一個隨機的 ID
  private getNextReqId() {
    const now = new Date().getTime(); 
    const random = Math.floor(Math.random() * 1000); 
    return random; 
  }



  // 2) await this.waitForResponse(5000); 通用等候
  private async waitForResponse(timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const handleCurrentTime = () => {
            clearTimeout(timer);
            this.client.removeListener(EventName.currentTime, handleCurrentTime); // 移除监听器
            resolve();
        };

        const timer = setTimeout(() => {
            this.client.removeListener(EventName.currentTime, handleCurrentTime); // 移除监听器
            reject(new Error('Timeout: No response from broker'));
        }, timeout);

        this.client.once(EventName.currentTime, handleCurrentTime);
        this.client.reqCurrentTime();
    });
}



  // 3) await this.waitForEvent(EventName.priceUpdate, () => this.client.reqPriceUpdate(), 5000); 通用等候
  private async waitForEvent(eventName: string, triggerEvent: () => void, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout: No response from event ${eventName}`));
      }, timeout);
  
      this.client.once(eventName, () => {
        clearTimeout(timer);
        resolve();
      });
  
      triggerEvent();
    });
  }

  
  // 4) 抽象錯誤處理邏輯
  private handleError(err: Error, reject: (reason?: any) => void) {
    console.error('Error:', err);
    reject(err);
  }

  // 5) Try Connect
  async connect(): Promise<void> {
    try {
      if (!this.client.isConnected) {
        this.client.connect();
        if (this.client.isConnected){
        await new Promise<void>((resolve, reject) => {
          this.client.once(EventName.connected, () => {
            console.log('Successfully connected to IBKR API.');
            if (this.nextOrderId === null) {
              this.client.reqIds(1);
            }
            resolve();
          });
          this.client.once(EventName.error, (error) => {
            reject(error);
          });
        });}
        
      }
    } catch (error) {
      console.error('Failed to connect to IBKR API:', error);
      throw error;
    }
  }

  // 6) 試下, 其實無用
  async testConnection() {
    try {
      await this.connect();
      return { status: 'success', message: 'Connected to IBKR API.' };
    } catch (error) {
      return { status: 'error', message: 'Failed to connect to IBKR API.', error: error.message };
    }
  }

  // 7) Auth, 其實都無用
  async authenticate(signal_trading_password: string, userEmail:string) {
    const mongoDBRes = await this.mongodbService.findSettingsByUsernameOrEmail(userEmail);
    const server_trading_password = mongoDBRes.trading_password
    if (signal_trading_password !== server_trading_password) {
      throw new UnauthorizedException('交易密碼錯誤');
    }
  }

  private removeListeners(listeners: { event: EventName, handler: (...args: any[]) => void }[]) {
    listeners.forEach(({ event, handler }) => {
        this.client.removeListener(event, handler);
    });
}


//=====================================================================AccountSummary
  async getAccountSummary(group: string = "All", tags: string = "NetLiquidation,TotalCashValue,SettledCash,AccruedCash"): Promise<Record<string, Record<string, { value: string; currency: string }>>> {

    await this.connect();

    const reqId = Math.floor(Math.random() * 1000);
    console.log(`正在提取基本IB帳戶訊息, reqId: ${reqId}\n`)

    return new Promise((resolve, reject) => {
      const summary: Record<string, Record<string, { value: string; currency: string }>> = {};

      const handleAccountSummary = (reqIdReceived: number, account: string, tag: string, value: string, currency: string) => {
        //console.log(`\ngetAccountSummary, handleAccountSummary reqIdReceived: ${reqIdReceived}\n\n`)
        if (reqId === reqIdReceived) {
          if (!summary[account]) {
            summary[account] = {};
          }
          summary[account][tag] = { value, currency };
        }
        
      };

      const handleAccountSummaryEnd = (reqIdReceived: number) => {
        if (reqId === reqIdReceived) {
          //console.log(`\ngetAccountSummary, handleAccountSummaryEnd reqIdReceived: ${reqIdReceived}\n\n`)
          
          this.removeListeners(listOfEvents);
          resolve(summary);
          this.cancelAccountSummary(reqIdReceived)
          const accountId = Object.keys(summary)[0];
          console.log(`handleAccountSummaryEnd ACCOUNT ID: ${accountId}`)
          return summary
        }
      };

      const handleError = (error: Error) => {
        //console.log(`\ngetAccountSummary, handleError reqId: ${reqId}\n\n`)
        this.removeListeners(listOfEvents);
        reject(error);
        
      };

      const listOfEvents = [
        { event: EventName.accountSummary, handler: handleAccountSummary },
        { event: EventName.accountSummaryEnd, handler: handleAccountSummaryEnd },
        { event: EventName.error, handler: handleError }
    ]

      this.client.on(EventName.accountSummary, handleAccountSummary);
      this.client.once(EventName.accountSummaryEnd, handleAccountSummaryEnd);
      this.client.once(EventName.error, handleError);

      this.client.reqAccountSummary(reqId, group, tags);
    });
  }


  async cancelAccountSummary(reqId: number): Promise<void> {
    await this.connect();

    return new Promise((resolve, reject) => {
      const handleCancelConfirmation = () => {
        this.removeListeners(listOfCancelEvents);
        resolve();
      };

      const handleError = (error: Error) => {
        this.removeListeners(listOfCancelEvents);
        reject(error);
      };

      const listOfCancelEvents = [
        { event: EventName.accountSummaryEnd, handler: handleCancelConfirmation },
        { event: EventName.error, handler: handleError }
      ];

      this.client.once(EventName.accountSummaryEnd, handleCancelConfirmation);
      this.client.once(EventName.error, handleError);

      this.client.cancelAccountSummary(reqId);
    });
  }

//=====================================================================AccountSummary


//=====================================================================getPositions
  async getPositions(): Promise<Position[]> {
    await this.connect();
    return new Promise((resolve, reject) => {
      const positions: Position[] = [];

      // 清理之前可能遗留的监听器
      this.client.removeAllListeners(EventName.position);
      this.client.removeAllListeners(EventName.positionEnd);
      this.client.removeAllListeners(EventName.error);

      const timeoutId = setTimeout(() => {
        this.client.removeAllListeners(EventName.position);
        this.client.removeAllListeners(EventName.positionEnd);
        this.client.removeAllListeners(EventName.error);
        reject(new Error('Request timed out'));
      }, TIMEOUT);  // 例如，30秒超时

      // 添加新的监听器来收集职位数据
      this.client.on(EventName.position, (account, contract, pos, avgCost) => {
        positions.push({ account, contract, pos, avgCost });
      });

      this.client.once(EventName.positionEnd, () => {
        clearTimeout(timeoutId);
        this.client.removeAllListeners(EventName.position);
        this.client.removeAllListeners(EventName.error);
        resolve(positions);
      });


      this.client.once(EventName.error, (err) => {
        this.client.removeAllListeners(EventName.position);
        this.client.removeAllListeners(EventName.positionEnd);
        reject(err); // 错误处理
      });

      // 发送请求获取职位
      this.client.reqPositions();
    });
  }
//=====================================================================getPositions




//=====================================================================getPnL
  async getPnL( modelCode: string = '') {
    const account = await this.getAccountId()
    if (!account) {
      throw new Error("Account must not be empty");
    }
    await this.connect();
    return new Promise((resolve, reject) => {
      const reqId = this.getNextReqId();  // 获取唯一请求ID

      const timeoutId = setTimeout(() => {
        this.client.removeAllListeners(EventName.pnl);
        this.client.removeAllListeners(EventName.error);
        reject(new Error('Request timed out'));
      }, TIMEOUT);  // 设置30秒超时

      this.client.once(EventName.pnl, (receivedReqId, dailyPnL, unrealizedPnL, realizedPnL) => {
        if (receivedReqId === reqId) {
          clearTimeout(timeoutId);
          this.client.removeAllListeners(EventName.error);
          resolve({ dailyPnL, unrealizedPnL, realizedPnL });
        }
      });

      this.client.once(EventName.error, (err) => {
        clearTimeout(timeoutId);
        this.client.removeAllListeners(EventName.pnl);
        reject(err);
      });

       this.client.reqPnL(reqId, account, modelCode);
    });
  }
//=====================================================================getPnL






//=====================================================================getPnLSingle
  async getPnLSingle(modelCode: string, conId: number) {
    const account = await this.getAccountId()
    if (!account) {
      throw new Error("Account must not be empty");
    }
    if (account) {
      await this.connect();
      return new Promise((resolve, reject) => {
        const reqId = this.getNextReqId();  // 获取唯一请求ID

        const timeoutId = setTimeout(() => {
          this.client.removeAllListeners(EventName.pnlSingle);
          this.client.removeAllListeners(EventName.error);
          reject(new Error('Request timed out'));
        }, TIMEOUT);  // 设置30秒超时

        this.client.once(EventName.pnlSingle, (receivedReqId, pos, dailyPnL, unrealizedPnL, realizedPnL, value) => {
          if (receivedReqId === reqId) {
            clearTimeout(timeoutId);
            this.client.removeAllListeners(EventName.error);
            resolve({ pos, dailyPnL, unrealizedPnL, realizedPnL, value });
          }
        });

        this.client.once(EventName.error, (err) => {
          clearTimeout(timeoutId);
          this.client.removeAllListeners(EventName.pnlSingle);
          reject(err);
        });

         this.client.reqPnLSingle(reqId, account, modelCode, conId);
      });
    }
  }


  //=====================================================================getPnLSingle

  async placeOrder(createOrderDto: CreateOrderDto) {
    await this.connect();  // 确保连接到API

    if (!this.readyToTrade) {
      console.error('System is not ready to trade.');
      throw new Error('System is not ready to trade.');
    }

    if (this.nextOrderId === null) {
      console.error('Next order ID has not been initialized.');
      throw new Error('Next order ID not initialized.');
    }



    const order: Order = {
      action: createOrderDto.action as OrderAction,
      orderType: createOrderDto.orderType as OrderType,
      totalQuantity: createOrderDto.totalQuantity,
      lmtPrice: createOrderDto.orderType === OrderType.LMT ? createOrderDto.lmtPrice : undefined,  // 使用 lmtPrice 對於限價單
      auxPrice: createOrderDto.orderType === OrderType.STP ? createOrderDto.auxPrice : undefined,   // 使用 auxPrice 對於停止價單
      transmit: true
    };

    // 构建Contract和Order对象
    const contract: Contract = {
      symbol: createOrderDto.symbol,
      secType: createOrderDto.secType as SecType,
      currency: createOrderDto.currency,
      exchange: createOrderDto.exchange
    };
    if (order.totalQuantity === 0){
      return {msg:"交易股數為 0 , 不提交訂單..."}
    }
  
    /* // 創建合約對象
const contract: Contract = {
 symbol: "AAPL",
 secType: SecType.STK,  // 使用枚舉值
 currency: "USD",
 exchange: "SMART"
};

// 創建訂單對象
const order: Order = {
 action: OrderAction.BUY,  // 使用枚舉值
 orderType: OrderType.LMT,  // 使用枚舉值
 totalQuantity: 1,
 lmtPrice: 145.50
};  */

    //console.log('Contract details:', contract);
    //console.log('Order details:', order);

    return new Promise<string>((resolve, reject) => {
      let orderId: number;

      const timeout = setTimeout(() => {
        this.client.removeListener(EventName.orderStatus, handleOrderStatus);
        this.client.removeListener(EventName.error, handleError);
        reject(new Error('Timeout: No response from broker'));
      }, TIMEOUT); // 30秒超时

      const handleError = (error: Error, code: number, reqId: number) => {

        clearTimeout(timeout);
        this.client.removeListener(EventName.orderStatus, handleOrderStatus);
        this.client.removeListener(EventName.error, handleError);
        reject(new Error(`Order placement error: ${error}`));


      };

      const handleOrderStatus = (id: number, status: string) => {
        if (id === orderId) {
          console.log(`Order status update: Status: ${status}`);
          if (['Filled', 'Submitted', 'PreSubmitted'].includes(status)) {
            clearTimeout(timeout);
            this.client.removeListener(EventName.orderStatus, handleOrderStatus);
            this.client.removeListener(EventName.error, handleError);
            resolve('Order Submitted');
          }
          if (['PendingCancel', 'Cancelled', 'Inactive',].includes(status)) {
            clearTimeout(timeout);
            this.client.removeListener(EventName.orderStatus, handleOrderStatus);
            this.client.removeListener(EventName.error, handleError);
            resolve('Order Cancelled');
          }
        }


      };

      // 添加事件监听器
      /* this.client.on(EventName.openOrder, (orderId, contract, order, orderState) => {
        console.log(`Open Order: OrderId: ${orderId}, Symbol: ${contract.symbol}, Action: ${order.action}, OrderType: ${order.orderType}, TotalQty: ${order.totalQuantity}, LmtPrice: ${order.lmtPrice}, Status: ${orderState.status}`);
      }); */


      /*       const handleAll = (event: string, ...args: any[]) => {
              console.log(`handleALL got Event: ${event}, Args:`, args);
              clearTimeout(timeout);
              this.client.removeListener(EventName.orderStatus, handleOrderStatus);
              this.client.removeListener(EventName.error, handleError);
              resolve();
            }; */

      /*  const handleRecieved = (event: string, ...args: any[]) => {
         console.log(`handleALL got Event: ${event}, Args:`, args);
         clearTimeout(timeout);
         this.client.removeListener(EventName.orderStatus, handleOrderStatus);
         this.client.removeListener(EventName.error, handleError);
         resolve();
       }; */

      /*  this.client.on(EventName.result, handleRecieved); */

      this.client.once(EventName.nextValidId, (id: number) => {
        orderId = id;
        try{
          this.client.placeOrder(orderId, contract, order);
        }catch  (error) {
          reject(`placeOrder error: ${error}`)
        }
        
      });

      this.client.on(EventName.orderStatus, handleOrderStatus);
      this.client.once(EventName.error, handleError);
      try {
        this.client.reqIds();
      }
      catch (error) {
        reject(`open position error: ${error}`)
      }

    });
  }


  async placeOrder2(_order:any, _contract:Contract, plusNumber?:number) {
    await this.connect();  // 确保连接到API

    if (!this.readyToTrade) {
      console.error('System is not ready to trade.');
      throw new Error('System is not ready to trade.');
    }

    if (this.nextOrderId === null) {
      console.error('Next order ID has not been initialized.');
      throw new Error('Next order ID not initialized.');
    }

    const order: Order = _order;
    this.print ("placeOrder2 檢查, order", order)

    const contract: Contract = _contract;

    if (order.totalQuantity === 0){
      return "交易股數為 0 , 不提交訂單..."
    }
    return new Promise<string>((resolve, reject) => {
      let orderId: number;

      const timeout = setTimeout(() => {
        this.client.removeListener(EventName.orderStatus, handleOrderStatus);
        this.client.removeListener(EventName.error, handleError);
        reject(new Error('Timeout: No response from broker'));
      }, TIMEOUT); // 30秒超时

      const handleError = (error: Error, code: number, reqId: number) => {

        clearTimeout(timeout);
        this.client.removeListener(EventName.orderStatus, handleOrderStatus);
        this.client.removeListener(EventName.error, handleError);
        reject(new Error(`Order placement error: ${error}`));


      };

      const handleOrderStatus = (id: number, status: string) => {
        if (id === orderId) {
          console.log(`Order status update: Status: ${status}`);
          if (['Filled', 'Submitted', 'PreSubmitted'].includes(status)) {
            clearTimeout(timeout);
            this.client.removeListener(EventName.orderStatus, handleOrderStatus);
            this.client.removeListener(EventName.error, handleError);
            resolve('Order Submitted');
            
          }
          if (['PendingCancel', 'Cancelled', 'Inactive',].includes(status)) {
            clearTimeout(timeout);
            this.client.removeListener(EventName.orderStatus, handleOrderStatus);
            this.client.removeListener(EventName.error, handleError);
            resolve('Order Cancelled');
       
          }
        }


      };


      this.client.once(EventName.nextValidId, (id: number) => {
        orderId = id;
        console.log(orderId)
        try{
          this.client.placeOrder(orderId = plusNumber? orderId+plusNumber :orderId, contract, order);
        }catch  (error) {
          reject(`placeOrder error: ${error}`)
        }
       
        resolve(orderId.toString());
        return orderId
      });

      this.client.on(EventName.orderStatus, handleOrderStatus);
      this.client.once(EventName.error, handleError);
      try {
        this.client.reqIds();
      }
      catch (error) {
        reject(`open position error: ${error}`)
      }

    });
  }




  //========================================================================================提取open orders
  /* async getOpenOrders(): Promise<MyOpenOrder[]> {
    await this.connect();
    return new Promise((resolve, reject) => {
      const openOrders: MyOpenOrder[] = [];

      this.client.on(EventName.openOrder, (orderId, contract, order, orderState) => {
        openOrders.push({ orderId, contract, order, orderState });
      });

      this.client.once(EventName.openOrderEnd, () => {
        resolve(openOrders);
      });

      this.client.once(EventName.error, (error) => {
        reject(error);
      });



      this.client.reqOpenOrders();
    });
  } */

  async getOpenOrders(): Promise<MyOpenOrder[]> {
    await this.connect();

    return new Promise((resolve, reject) => {
      const openOrders: MyOpenOrder[] = [];
      const timeout = setTimeout(() => {
        this.client.removeListener(EventName.openOrder, handleOpenOrder);
        this.client.removeListener(EventName.error, handleError);
        reject(new Error('Timeout: No response from broker'));
      }, 30000); // 30秒超時

      const handleError = (error: Error) => {
        clearTimeout(timeout);
        this.client.removeListener(EventName.openOrder, handleOpenOrder);
        this.client.removeListener(EventName.error, handleError);
        reject(error);
      };

      const handleOpenOrder = (orderId, contract, order, orderState) => {
        openOrders.push({ orderId, contract, order, orderState });
      };

      const handleOpenOrderEnd = () => {
        clearTimeout(timeout);
        this.client.removeListener(EventName.openOrder, handleOpenOrder);
        this.client.removeListener(EventName.error, handleError);
        resolve(openOrders);
      };

      // 設置事件處理器
      this.client.on(EventName.openOrder, handleOpenOrder);
      this.client.once(EventName.openOrderEnd, handleOpenOrderEnd);
      this.client.once(EventName.error, handleError);

      // 發起請求
      try {
        this.client.reqOpenOrders();
      } catch (error) {
        handleError(error);
      }
    });
  }


  //========================================================================================提取open orders






  async cancelAllOrders() {
    await this.connect();

    // 检查是否有待处理的订单
    const openOrders = await this.getOpenOrders();
    if (openOrders.length === 0) {
      console.log('No open orders to cancel');
      return { msg: 'No open orders to cancel' };
    }

    return new Promise<{ msg: string }>((resolve, reject) => {
      let orderCancelled = false;
      const timeout = setTimeout(() => {
        this.client.removeListener(EventName.orderStatus, handleOrderStatus);
        this.client.removeListener(EventName.error, handleError);
        reject(new Error('Timeout: No response from broker'));
      }, 30000); // 30秒超时

      const handleError = (error: Error, code: number, reqId: number) => {
        if (code === 202) {
          console.log(`API 錯誤: ${error} \n錯誤代碼: ${code} Request ID: ${reqId}`);
          // 忽略 "Order Canceled" 错误,因为这是预期的行为
          resolve({ msg: `Cancelled all orders` });
        } else {
          console.error(`API 錯誤: ${error} \n錯誤代碼: ${code} Request ID: ${reqId}`);
          // 对于其他错误,直接拒绝 Promise
          clearTimeout(timeout);
          this.client.removeListener(EventName.orderStatus, handleOrderStatus);
          this.client.removeListener(EventName.error, handleError);
          reject(new Error(`Cancel all orders error: ${error}`));
        }
      };

      const handleOrderStatus = (orderId: number, status: string) => {
        console.log(`Order status update: OrderId: ${orderId}, Status: ${status}`);
        if (status === 'Cancelled') {
          orderCancelled = true;
          clearTimeout(timeout);
          this.client.removeListener(EventName.orderStatus, handleOrderStatus);
          this.client.removeListener(EventName.error, handleError);
          resolve({ msg: 'Cancelled all orders' });
        }
      };

      this.client.on(EventName.orderStatus, handleOrderStatus);
      this.client.once(EventName.error, handleError);
      this.client.reqGlobalCancel();
    });
  }

  async closePosition(createClosePositionDto: CreateClosePositionDto) {

    const positions = await this.getPositions();
    const position = positions.find((p) => p.contract.symbol === createClosePositionDto.symbol);
    if (!position) {
      throw new Error('Position not found');
    }

    const cancelOrderDto: CreateOrderDto = {
      symbol: position.contract.symbol,
      secType: position.contract.secType as SecType,
      currency: position.contract.currency,
      exchange: position.contract.exchange,
      action: OrderAction.SELL,
      orderType: createClosePositionDto.orderType as OrderType,
      totalQuantity: createClosePositionDto.totalQuantity,
      lmtPrice: createClosePositionDto.orderType === OrderType.LMT ? createClosePositionDto.lmtPrice : undefined,  // 使用 lmtPrice 對於限價單
      //auxPrice: createOrderDto.orderType === OrderType.STP ? createOrderDto.auxPrice : undefined,   // 使用 auxPrice 對於停止價單

    }

    if (position.pos - createClosePositionDto.totalQuantity < 0) {
      // 如果要卖出的数量大于持有数量，就卖出所有持有数量
      cancelOrderDto.totalQuantity = position.pos;
    } else {
      // 否则，按照指定的数量卖出
      cancelOrderDto.totalQuantity = createClosePositionDto.totalQuantity;
    }
    //console.log(cancelOrderDto)

    await this.placeOrder(cancelOrderDto);
  }

  calculateStockPurchase(totalCash: number, percentage: number, pricePerStock: number) {
    const amountToInvest = totalCash * (percentage / 100);
    const numberOfStocks = Math.floor(amountToInvest / pricePerStock);
    return numberOfStocks;
  }



  async getExecutionDetails(filter: ExecutionFilter): Promise<ExecutionDetail[]> {

    return new Promise((resolve, reject) => {
        const executions: ExecutionDetail[] = [];

        const handleExecDetails = (reqId: number, contract: Contract, execution: Execution) => {
            executions.push({ reqId, contract, execution });
        };

        const cleanupAndResolve = () => {
            this.removeListeners([
                { event: EventName.execDetails, handler: handleExecDetails },
                { event: EventName.execDetailsEnd, handler: cleanupAndResolve },
                { event: EventName.error, handler: handleError }
            ]);
            resolve(executions);
        };

        const handleError = (err: Error) => {
            this.removeListeners([
                { event: EventName.execDetails, handler: handleExecDetails },
                { event: EventName.execDetailsEnd, handler: cleanupAndResolve },
                { event: EventName.error, handler: handleError }
            ]);
            reject(err);
        };

        this.client.on(EventName.execDetails, handleExecDetails);
        this.client.once(EventName.execDetailsEnd, cleanupAndResolve);
        this.client.once(EventName.error, handleError);

        this.client.reqExecutions(this.getNextReqId(), filter);
    });
  }

  async getCommissionReport(filter: ExecutionFilter): Promise<CommissionReport[]> {
    return new Promise((resolve, reject) => {
      const reports: CommissionReport[] = [];

      const handleCommissionReport = (commissionReport: CommissionReport) => {
        reports.push(commissionReport);
      };


      const handleError = (err: Error) => {
        this.client.removeListener(EventName.commissionReport, handleCommissionReport);
        this.client.removeListener(EventName.execDetailsEnd, handleExecDetailsEnd);
        this.client.removeListener(EventName.error, handleError);
        reject(err);
      };

      const handleExecDetailsEnd = (reqId: number) => {
        this.client.removeListener(EventName.commissionReport, handleCommissionReport);
        this.client.removeListener(EventName.execDetailsEnd, handleExecDetailsEnd);
        this.client.removeListener(EventName.error, handleError);
        resolve(reports);
      };

      this.client.on(EventName.commissionReport, handleCommissionReport);
      this.client.once(EventName.execDetailsEnd, handleExecDetailsEnd);
      this.client.once(EventName.error, handleError);

      const reqId = this.getNextReqId();
      this.client.reqExecutions(reqId, filter);
    });
  }

  reqMarketDataType(marketDataType: MarketDataType): void {
    this.client.reqMarketDataType(marketDataType);
  }

  subscribeToMarketData(reqId: number, contract: Contract, genericTickList: string, snapshot: boolean, regulatorySnapshot: boolean, mktDataOptions?: TagValue[]): void {
    this.client.reqMktData(reqId, contract, genericTickList, snapshot, regulatorySnapshot);
  }

  subscribeToHistoricalData(reqId: number, contract: Contract, endDateTime: string, durationStr: string, barSizeSetting: BarSizeSetting, whatToShow: WhatToShow, useRTH: number, formatDate: number, keepUpToDate: boolean): void {
    this.client.reqHistoricalData(reqId, contract, endDateTime, durationStr, barSizeSetting, whatToShow, useRTH, formatDate, keepUpToDate);
  }

  async getContractDetails(symbol: string): Promise<Contract[]> {
    await this.ensureConnected(); // 确保连接到 API
    return new Promise<Contract[]>((resolve, reject) => {
        const contract: Contract = {
            symbol: symbol,
            secType: SecType.STK,
            currency: 'USD',
            exchange: 'SMART'
        };

        const contracts: Contract[] = [];

        // 错误处理函数
        const handleError = (err: Error) => {
            this.client.removeListener(EventName.contractDetails, handleContractDetails);
            this.client.removeListener(EventName.contractDetailsEnd, handleContractDetailsEnd);
            console.error('Error:', err);
            this.client.disconnect();  // 断开连接
            reject(err);
        };

        // 处理合约详情的函数
        const handleContractDetails = (reqId, contractDetails) => {
            contracts.push({
                symbol: contractDetails.contract.symbol,
                secType: contractDetails.contract.secType,
                currency: contractDetails.contract.currency,
                exchange: contractDetails.contract.exchange,
                primaryExch: contractDetails.contract.primaryExch,
                conId: contractDetails.contract.conId,
            });
        };

        // 处理合约详情结束的函数
        const handleContractDetailsEnd = (reqId) => {
            this.client.removeListener(EventName.contractDetails, handleContractDetails);
            this.client.removeListener(EventName.error, handleError);
            this.client.disconnect();  // 断开连接
            resolve(contracts);
        };

        // 注册事件监听器
        this.client.on(EventName.contractDetails, handleContractDetails);
        this.client.once(EventName.contractDetailsEnd, handleContractDetailsEnd);
        this.client.once(EventName.error, handleError);

        // 请求合约详情
        const reqId = this.getNextReqId(); // 确保使用有效的 reqId
        this.client.reqContractDetails(reqId, contract);
    });
}






  async getLatestPrice(symbol: string): Promise<number> {

    await this.ensureConnected();
    
    return new Promise<number>((resolve, reject) => {
      
        const contract: Contract = {
            symbol: symbol,
            secType: SecType.STK,
            currency: 'USD',
            exchange: 'SMART'
        };

        
          try{
        let latestPrice = 0;

        // 处理价格更新的函数
        const handleTickPrice = (tickerId: number, tickType: number, price: number) => {
            if (tickType === 4) { // Last Price
                latestPrice = price;
            }
        };

        // 处理快照结束的函数
        const handleTickSnapshotEnd = (reqId: number) => {
            this.client.removeListener(EventName.tickPrice, handleTickPrice);
            this.client.removeListener(EventName.error, handleError);
            this.client.cancelMktData(reqId);
       
            resolve(latestPrice);
        };

        // 错误处理函数
        const handleError = (err: Error, code: number, reqId: number) => {
            this.client.removeListener(EventName.tickPrice, handleTickPrice);
            this.client.removeListener(EventName.tickSnapshotEnd, handleTickSnapshotEnd);
          
            this.client.cancelMktData(reqId);
            reject(err);
        };

        // 添加事件监听器
        this.client.on(EventName.tickPrice, handleTickPrice);
        this.client.once(EventName.tickSnapshotEnd, handleTickSnapshotEnd);
        this.client.once(EventName.error, handleError);

        // 发送市场数据请求
        
        const reqId = this.getNextReqId();
        this.client.reqMktData(reqId, contract, '100,101,104', false, false);
      }
        catch(error){
          console.log(`拿不到最新的${symbol}價錢: Error: ${error.message}`)
          throw new Error(`拿不到最新的${symbol}價錢: Error: ${error.message}`)
        };
    });
}

  //StopLimitOrder
  async submitStopLimitOrder(
    contract:any,
    order:any, 
  ){
    const stopLimitOrder:Order = {
     
      action:           order.action.toString().toLowerCase() === "buy"? OrderAction.SELL: OrderAction.BUY,
      orderType:        order.stopLossType.toString().toLowerCase() === "mkt"? OrderType.STP: OrderType.STP_LMT,
      lmtPrice:         order.auxPrice,
      totalQuantity:    order.totalQuantity,
      auxPrice:         order.auxPrice,
      tif:              TimeInForce.GTC,
      transmit:         true
    }
    this.print("準備 stopLimitOrder", stopLimitOrder)
    const stopLossOrderId = await this.placeOrder2(stopLimitOrder,contract,1)
    this.print("己經提交 stopLimitOrder, ID", stopLossOrderId)
    return stopLossOrderId
    };


  async submitTakeProfitOrder(
    contract:any,
    order:any, 
  ){
    const takeProfitOrder:Order = {
      action: order.action.toString().toLowerCase() === "buy"? OrderAction.SELL: OrderAction.BUY,
      orderType: order.takeProfitType.toString().toLowerCase() === "mkt"? OrderType.STP: OrderType.STP_LMT,
      lmtPrice: order.takeProfitPrice,
      totalQuantity: order.totalQuantity,
      auxPrice: order.takeProfitPrice,
      tif:              TimeInForce.GTC,
      transmit: true
    }
    this.print("準備 takeProfitOrder", takeProfitOrder)
    const takeProfitOrderId = await this.placeOrder2(takeProfitOrder,contract,2)
    this.print("己經提交 takeProfitOrder, ID", takeProfitOrderId)
    return takeProfitOrderId
    };


    async checkOpenOrder(symbol: string): Promise<void> {
      return new Promise(async (resolve, reject) => {
        const orders:List=[]
        try {
          this.print("查找當前的未成交訂單", symbol);
          const openOrders = await this.getOpenOrders();
          const filteredOrders = openOrders.filter(order => order.contract.symbol.toUpperCase() === symbol.toUpperCase());
          if (filteredOrders.length > 0) {
            this.print("未成交訂單:", filteredOrders);
            // 打印每個訂單的詳情
            filteredOrders.forEach(order => {
              console.log(`訂單 ID: ${order.orderId}`);
              console.log(`操作: ${order.order.action}`);
              console.log(`數量: ${order.order.totalQuantity}`);
              console.log(`訂單類型: ${order.order.orderType}`);
              console.log(`限價: ${order.order.lmtPrice}`);
              console.log(`輔助價格(觸發價): ${order.order.auxPrice}`);
              console.log(`到期日: ${order.order.tif}`);
              console.log('合約詳情:');
              console.log(`  股票代碼: ${order.contract.symbol}`);
              console.log(`  證券類型: ${order.contract.secType}`);
              console.log(`  交易所: ${order.contract.exchange}`);
              console.log(`  貨幣: ${order.contract.currency}`);
              console.log('---');
          
            });
          } else {
            this.print("沒有未成交訂單", symbol);
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }

    async cancelOneSymbolPendingOrders(symbol: string): Promise<void> {
      return new Promise(async (resolve, reject) => {
        const orders: any[] = []; // 改為 any[] 類型
        try {
          this.print("查找當前的未成交訂單", symbol);
          const openOrders = await this.getOpenOrders();
          const filteredOrders = openOrders.filter(order => order.contract.symbol.toUpperCase() === symbol.toUpperCase());
          if (filteredOrders.length > 0) {
            this.print("未成交訂單:", filteredOrders);
            // 打印每個訂單的詳情
            filteredOrders.forEach(order => {
             
              // 將訂單添加到 orders 數組中
              orders.push(order);
            });
            
            // 取消所有未成交訂單
            for (const order of orders) {
              try {
                await this.client.cancelOrder(order.orderId);
                this.print("已取消訂單", order.orderId);
              } catch (error) {
                this.print(`取消訂單 ${order.orderId} 時發生錯誤:`, error);
              }
            }
          } else {
            this.print("沒有未成交訂單", symbol);
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }

    async cancelOneOrder(orderId: number): Promise<void> {
      return new Promise(async (resolve, reject) => {
        
        try {
         await this.client.cancelOrder(orderId);
     
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }
    
    async checkPosition(symbol: string): Promise<void> {
      return new Promise(async (resolve, reject) => {
        try {
          this.print("查找當前倉位", symbol);
          const positions = await this.getPositions();
          const position = positions.find(p => p.contract.symbol.toUpperCase() === symbol.toUpperCase());
          if (position) {
            this.print("當前倉位:", position);
          } else {
            this.print("沒有當前倉位", symbol);
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }
    
    /* async closeOnePosition(symbol: string): Promise<void> {
      return new Promise(async (resolve, reject) => {
        try {
          this.print("取消所有倉位", symbol);
          const positions = await this.getPositions();
          const position = positions.find(p => p.contract.symbol.toUpperCase() === symbol.toUpperCase());
          this.print("取消所有倉位 position", position);
          if (position) {

            const order: Order = {
              action: position.pos > 0 ? OrderAction.SELL : OrderAction.BUY,
              orderType: OrderType.MKT,
              totalQuantity: Math.abs(position.pos),
              transmit: true
            };
        
            // 构建Contract和Order对象
            const contract: Contract = {
              symbol: position.contract.symbol,
              secType: position.contract.secType as SecType,
              currency:position.contract.currency,
              exchange: "SMART"
            };


            this.print("取消所有倉位 order", order);
            this.print("取消所有倉位 contract", contract);
            const response = await this.placeOrder2(order, contract);
            this.print("已取消倉位", response);
          } else {
            this.print("沒有可取消的倉位", symbol);
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    } */
    async closeOnePosition(symbol: string): Promise<string> {
      return new Promise(async (resolve, reject) => {
        try {
          this.print("Attempting to close all positions for", symbol);
          const positions = await this.getPositions();
          const position = positions.find(p => p.contract.symbol.toUpperCase() === symbol.toUpperCase());
          this.print("Found position", position);
    
          if (position) {
            const order: Order = {
              action: position.pos > 0 ? OrderAction.SELL : OrderAction.BUY,
              orderType: OrderType.MKT,
              totalQuantity: Math.abs(position.pos),
              transmit: true
            };
        
            const contract: Contract = {
              symbol: position.contract.symbol,
              secType: position.contract.secType as SecType,
              currency: position.contract.currency,
              exchange: "SMART"
            };
    
            this.print("Building order", order);
            this.print("Building contract", contract);
            const response = await this.placeOrder2(order, contract);
            this.print("Position closed", response);
            resolve(`Order placed successfully: ${JSON.stringify(response)}`);
          } else {
            this.print("No position found for", symbol);
            resolve(null);
          }
        } catch (error) {
          reject(error);
        }
      });
    }
    

     
    


}//最後

 
/* 常見訂單類型
DAY: 日內有效，如果當天未成交則自動取消。
 (Good Till Cancelled): 直到取消前有效，這意味著訂單會保持開啟狀態直到被取消或成交。
GTD (Good Till Date): 直到某個特定日期前有效，如果到了那天訂單還未成交，則自動取消。
IOC (Immediate or Cancel): 立即成交並取消未成交的部分。
FOK (Fill or Kill): 必須立即全部成交，否則完全取消。
LMT (Limit): 限價單，指定最高買入價或最低賣出價。
MKT (Market): 市價單，以當前市場價格執行。
STP (Stop): 止損單，當商品價格達到某一特定價格時觸發一個市價單。
STPLMT (Stop Limit): 止損限價單，當商品價格達到某一特定價格時觸發一個限價單。
TRAIL (Trailing Stop): 跟踪止損單，隨市場價格移動而調整止損價。
MIT (Market If Touched): 如果市價達到指定價格，則以市價買入或賣出。
特殊訂單類型與策略
AON (All or None): 全部或無，訂單必須完全成交或完全不成交。
ALGO (Algorithmic Order): 使用算法來優化執行策略的訂單。
PEGBENCH (Pegged to Benchmark): 訂單價格與某個基準（如指數）相關聯。
DARKONLY: 只在暗池（隱蔽的市場）中執行。
ICE (Iceberg): 冰山單，大額訂單被分成較小的部分來隱藏實際市場需求。
HID (Hidden Order): 隱藏訂單，訂單的存在不會顯示在市場深度中。
交易時間與市場條件相關
RTH (Regular Trading Hours): 僅在常規交易時段內有效。
EXT (Extended Trading Hours): 包括非常規交易時段。
OPG (Opening Order): 開盤時執行的訂單。 */