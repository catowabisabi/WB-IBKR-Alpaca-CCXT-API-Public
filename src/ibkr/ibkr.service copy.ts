import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IBApi, Contract, Order, OrderAction, OrderType, SecType, MarketDataType, BarSizeSetting, WhatToShow, ExecutionFilter, EventName, IBApiNext } from '@stoqey/ib';
import { Execution, ExecutionDetail } from '@stoqey/ib';
import { CommissionReport } from '@stoqey/ib';
import { TagValue } from '@stoqey/ib';
import { MyOpenOrder } from "./ibkr.interface"
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateClosePositionDto } from './dto/create-close-position.dto';
import { Position } from './ibkr.interface';

// 定義常量
const TIMEOUT = 30000;

@Injectable()
export class IbkrService {

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

    } catch (error) {
      console.error('IBKR API 連線不能:', error);
      this.apiReady = false;
    }
  }

  //=================================設定VAR
  private client: IBApi;
  //private client2: IBApiNext;
  private readonly PASSWORD = 'IB ACCOUNT PASSWORD';
  //private readonly ACCOUNT = 'IB TWS ACCOUNT NUMBER';
  private ACCOUNT_ID = 'IB TWS ACCOUNT ID';
  private nextOrderId: number | null = null;  // 用於存儲下一個有效的訂單ID
  //private nextValidId: number = 0;
  private readyToTrade = false;  // 用于标志是否准备好交易
  private apiReady = false;
  //=================================設定VAR

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
        console.error(`API Error: ${error} Code: ${code} Request ID: ${reqId}`);
      });

      //Open Order
      this.client.once(EventName.openOrder, (orderId, contract, order, orderState) => {
        console.log(`Open Order: OrderId: ${orderId}, Symbol: ${contract.symbol}, Action: ${order.action}, OrderType: ${order.orderType}, TotalQty: ${order.totalQuantity}, LmtPrice: ${order.lmtPrice}, Status: ${orderState.status}`);
      }); 

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
       //如果在一定時間沒有回應 Reject
      const timer = setTimeout(() => {
        reject(new Error('Timeout: No response from broker'));
      }, timeout);
      this.client.once(EventName.currentTime, () => {
        clearTimeout(timer);
        resolve();
      });
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
  authenticate(password: string) {
    if (password !== this.PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
  }

  async getAccountSummary(group: string = "All", tags: string = "NetLiquidation,TotalCashValue,SettledCash,AccruedCash"): Promise<Record<string, Record<string, { value: string; currency: string }>>> {
    await this.connect();
    const reqId = Math.floor(Math.random() * 1000);

    return new Promise((resolve, reject) => {
      const summary: Record<string, Record<string, { value: string; currency: string }>> = {};

      const handleAccountSummary = (reqIdReceived: number, account: string, tag: string, value: string, currency: string) => {
        if (reqId === reqIdReceived) {
          if (!summary[account]) {
            summary[account] = {};
          }
          summary[account][tag] = { value, currency };
        }
      };

      const handleAccountSummaryEnd = (reqIdReceived: number) => {
        if (reqId === reqIdReceived) {
          this.client.removeAllListeners(EventName.accountSummary);
          this.client.removeAllListeners(EventName.accountSummaryEnd);
          this.client.removeAllListeners(EventName.error);
          resolve(summary);
          return summary
        }
      };

      const handleError = (error: Error) => {
        this.client.removeAllListeners(EventName.accountSummary);
        this.client.removeAllListeners(EventName.accountSummaryEnd);
        this.client.removeAllListeners(EventName.error);
        reject(error);
      };

      this.client.on(EventName.accountSummary, handleAccountSummary);
      this.client.once(EventName.accountSummaryEnd, handleAccountSummaryEnd);
      this.client.once(EventName.error, handleError);

      this.client.reqAccountSummary(reqId, group, tags);
    });
  }

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

  async getPnL(account: string = this.ACCOUNT_ID, modelCode: string = '') {
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

  async getPnLSingle(account: string = this.ACCOUNT_ID, modelCode: string, conId: number) {
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
        this.client.placeOrder(orderId, contract, order);
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


  async placeOrder2(_order:Order, _contract:Contract) {
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

    const contract: Contract = _contract;


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
        this.client.placeOrder(orderId, contract, order);
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



  async getOpenOrders(): Promise<MyOpenOrder[]> {
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
  }

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
          console.log(`API Error: ${error} Code: ${code} Request ID: ${reqId}`);
          // 忽略 "Order Canceled" 错误,因为这是预期的行为
          resolve({ msg: `Cancelled all orders` });
        } else {
          console.error(`API Error: ${error} Code: ${code} Request ID: ${reqId}`);
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

      const handleExecDetailsEnd = (reqId: number) => {
        this.client.removeListener(EventName.execDetails, handleExecDetails);
        this.client.removeListener(EventName.execDetailsEnd, handleExecDetailsEnd);
        this.client.removeListener(EventName.error, handleError);
        resolve(executions);
      };

      const handleError = (err: Error) => {
        this.client.removeListener(EventName.execDetails, handleExecDetails);
        this.client.removeListener(EventName.execDetailsEnd, handleExecDetailsEnd);
        this.client.removeListener(EventName.error, handleError);
        reject(err);
      };

      this.client.on(EventName.execDetails, handleExecDetails);
      this.client.once(EventName.execDetailsEnd, handleExecDetailsEnd);
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

  async getContractDetails(symbol: string): Promise<Contract[]> {try{
    return new Promise<Contract[]>((resolve, reject) => {
      const contract: Contract = {
        symbol: symbol,
        secType: SecType.STK,
        currency: 'USD',
        exchange: 'SMART'
      };

      const contracts: Contract[] = [];

      this.client.once(EventName.nextValidId, (orderId: number) => {
        this.client.reqContractDetails(orderId, contract);
      });

      this.client.on(EventName.contractDetails, (reqId, contractDetails) => {
        //console.log('getContractDetails -- Contract Details:', contractDetails);
        contracts.push({
          symbol: contractDetails.contract.symbol,
          secType: contractDetails.contract.secType,
          currency: contractDetails.contract.currency,
          exchange: contractDetails.contract.exchange,
          primaryExch: contractDetails.contract.primaryExch,
          conId:contractDetails.contract.conId,
          

        });
      });

      this.client.once(EventName.contractDetailsEnd, (reqId) => {
        //console.log('Contract Details End');
        this.client.disconnect();
        resolve(contracts);
      });

      this.client.on(EventName.error, (err) => {
        console.log('Error:', err);
        this.client.disconnect();
        reject(err);
      });

      // Connect to IB server
      if (!this.client.isConnected){
        this.client.connect();
      }else{
      
          this.client.reqContractDetails(1, contract);
        
      }
      
    });}catch (error) {
      console.log(`getContractDetails: ${error}`)
    }
  }
}
/* 常見訂單類型
DAY: 日內有效，如果當天未成交則自動取消。
GTC (Good Till Cancelled): 直到取消前有效，這意味著訂單會保持開啟狀態直到被取消或成交。
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