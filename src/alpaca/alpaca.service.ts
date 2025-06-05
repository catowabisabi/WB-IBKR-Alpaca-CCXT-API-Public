//src\alpaca\alpaca.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { UserSettingsService } from 'src/user-settings/user-settings.service';
/* import { AssetRequestDto } from './dto/asset-request.dto';
import { AccountRequestDto } from './dto/account-request.dto'; */
import { AlpacaRequestDto } from './dto/alpaca-request.dto';

@Injectable()
export class AlpacaService {
    constructor(
        private readonly userSettingsService: UserSettingsService, 
       ) {}

  private readonly paperTradeBaseUrl = 'https://paper-api.alpaca.markets/v2';
  private readonly liveTradeBaseUrl = 'https://api.alpaca.markets/v2';
  


  async getApiEndPoint(email:string, mode:string, endPointUrl:string, params?: Record<string, any>, id?: string, method?:string) {
    const userApiKeys = await this.userSettingsService.getKeysOfUser(email);
    const paperKey = userApiKeys.alpacaPaper.key;
    const paperSecret =userApiKeys.alpacaPaper.secret;
    const liveKey = userApiKeys.alpacaLive.key;
    const liveSecret =userApiKeys.alpacaLive.secret;

    let apiUrl = mode == "live"?`${this.liveTradeBaseUrl+endPointUrl}`: `${this.paperTradeBaseUrl+endPointUrl}`

    if (method =="get"){
        if (id) {apiUrl += `/${id}`;};
        if (params) {
            const queryString = new URLSearchParams(params).toString();
            apiUrl += (apiUrl.includes('?') ? '&' : '?') + queryString;
          };};

    if ((method =="patch") &&(id)){apiUrl += `/${id}`};

    if (method =="delete"){
        if (id){apiUrl += `/${id}`}
        if (params) {
            const queryString = new URLSearchParams(params).toString();
            apiUrl += (apiUrl.includes('?') ? '&' : '?') + queryString;
        };};
 

    const authHeaders =  {headers: {
        'APCA-API-KEY-ID': mode === "live"? liveKey:paperKey,
        'APCA-API-SECRET-KEY': mode === "live"?liveSecret:paperSecret,
      }};

      console.log(`\n\n==================================================================\n`)
      console.log(`使用Alpaca API 提取資料: ` + method);
    console.log(`使用接到alpaca的方法為: ` + method);
    //console.log(`轉換成為 authHeader: ` + JSON.stringify(authHeaders, null, 2));
    console.log(`轉換成為 apiUrl: ` + apiUrl);
    console.log(`\n==================================================================\n\n\n\n`)

    return {authHeaders, apiUrl}
  };

  /* async getAccount(body:AccountRequestDto) {
    const {email, mode} = body
    const endpoint = "/account"
    const {authHeaders, apiUrl} = await this.getApiEndPoint(  email, mode, endpoint);

    try {
      const response = await axios.get(apiUrl, authHeaders);
      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  } */

  /* async getAssets(body:AssetRequestDto) {
    const {email, mode, symbol} = body;
    const endpoint = `/assets/${symbol}`
    const {authHeaders, apiUrl} = await this.getApiEndPoint(  email, mode, endpoint);

    try {
      const response = await axios.get(apiUrl, {
        ...authHeaders,
        params: { symbol },
      });
      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  } */


  async postDataAdvance(body:AlpacaRequestDto) {
    const {endpoint, email, mode, params, id, method } = body
    const {authHeaders, apiUrl} = await this.getApiEndPoint(  email, mode, endpoint, params, id, method);
    

    console.log(params?params:"no params provided")
    try {
    
      const response = 
      (method == "post")?   await axios.post  (apiUrl, params,authHeaders,):
      (method == "patch")?  await axios.patch (apiUrl, params,authHeaders,):
      (method == "delete")? await axios.delete(apiUrl, authHeaders,):
                            await axios.get   (apiUrl, authHeaders)
    
      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async postData(body:AlpacaRequestDto) {
    const {endpoint, email, mode, params, id } = body
    const {authHeaders, apiUrl} = await this.getApiEndPoint(  email, mode, endpoint, params, id, "post");
    console.log(authHeaders)
    console.log(apiUrl)

    console.log(params)

    try {
      const response = await axios.post(apiUrl, 
        params,
        authHeaders,
      );
    
      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // cancel order

    

    // oco 當你有單時, 你想入stlp
    // 一定要係反方向, 仲一定要有貨, 要係Exit order, 但未試到, 唔知係唔係
/* 
    {
    "endpoint": "/orders",
    "email":"example@gmail.com",
    "mode":"paper",
    "params":{
        "symbol":"WULF",
        "side":"buy",
        "type":"limit",
        "qty":3,
        "limit_price": 2.4,
        
        "time_in_force":"day",
        "client_order_id":"com4",
        "order_class":"oco",

        "take_profit":{"limit_price": 2},
        "stop_loss":{"stop_price":3}
        }
    
  } 
    
    */

    // bracket order 當你未有單時, 你想入一張單加sltp
    /* {
        "endpoint": "/orders",
        "email":"example@gmail.com",
        "mode":"paper",
        "params":{
            "symbol":"WULF",
            "side":"buy",
            "type":"limit",
            "qty":3,
            "limit_price": 2.4,
            
            "time_in_force":"day",
            "client_order_id":"xxx@gmail.comcom3",//
            "order_class":"bracket",
    
            "take_profit":{"limit_price": 3},
            "stop_loss":{"stop_price":2}
            }
        
      } 
 */

    // with order id and order_class
   /*  {
        "endpoint": "/orders",
        "email":"example@gmail.com",
        "mode":"paper",
        "params":{
            "symbol":"WULF",
            "side":"buy",
            "type":"limit",
            "qty":3,
            "limit_price": 2.4,
            
            "time_in_force":"day",
            "client_order_id":"example@gmail.com1",
            "order_class":"simple"
            }
        
      }  */

    //基本的market order with qty
   /*  {
        "endpoint": "/orders",
        "email":"example@gmail.com",
        "mode":"paper",
        "params":{
            "symbol":"SNDL",
            "side":"buy",
            "type":"market",
            "qty":"2",
        
            "time_in_force":"day"
        }
  }   */

      //基本的market order with notional
   /*  {
            "endpoint": "/orders",
            "email":"example@gmail.com",
            "mode":"paper",
            "params":{
                "symbol":"SNDL",
                "side":"buy",
                "type":"market",
                "notional":100,
                
                "time_in_force":"gtc"
        }
  }   */


  //Limit Order
  /* {
    "endpoint": "/orders",
    "email":"example@gmail.com",
    "mode":"paper",
    "params":{
        "symbol":"WULF",
        "side":"buy",
        "type":"limit",
        "qty":3,
        "limit_price": 2.4,
        
        "time_in_force":"day"
        }
  }  */

  // 買btc
  /* {
    "endpoint": "/orders",
    "email":"example@gmail.com",
    "mode":"paper",
    "params":{
        "symbol":"BTC/USDT",
        "side":"buy",
        "type":"market",
        "qty":0.001,
      
        
        "time_in_force":"gtc",
        "client_order_id":"example@gmail.com4"
  

     
        }
    
  }  */

}






  async getData(body:AlpacaRequestDto) {
    const {endpoint, email, mode, params, id } = body
    const {authHeaders, apiUrl} = await this.getApiEndPoint(  email, mode, endpoint, params, id , "get");
    console.log(apiUrl)

    try {
      const response = await axios.get(apiUrl, authHeaders);
      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 拎掙幾多錢
    /* {
        "endpoint": "/account/portfolio/history",
        "email":"example@gmail.com",
        "mode":"paper"
      }  */

    //拎所有倉位

    /* {
        "endpoint": "/positions",
        "email":"example@gmail.com",
        "mode":"paper"
       
    
      } */ 


      


    // 拎positions
    /* {
        "endpoint": "/positions",
        "email":"example@gmail.com",
        "mode":"paper"
        
    
      }  */

      //拎一隻
      /* {
    "endpoint": "/positions",
    "email":"example@gmail.com",
    "mode":"paper",
    "id":"35f33a69-f5d6-4dc9-b158-4485e5e92e4b",
    

  }  */

    // == 拎Symbal既資料, 但呢度黎講, 無呢個aapl // symbol要大寫
    /* {
    "endpoint": "/assets/BTC/USDT",
    "email":"example@gmail.com",
    "mode":"paper"
   
  }  */

//拎一交易所既所有assets
  /* {
    "endpoint": "/assets",
    "email":"example@gmail.com",
    "mode":"paper",
    "params":{"exchange":"NYSE"}
} */

// 拎帳戶資料
/* {
    "endpoint": "/account",
    "email":"example@gmail.com",
    "mode":"paper"
   
} */





// orders

// 拎所有既order
/* {
    "endpoint": "/orders",
    "email":"example@gmail.com",
    "mode":"paper"

  }  */

  // 拎order有filter
 /*  {
    "endpoint": "/orders",
    "email":"example@gmail.com",
    "mode":"paper",

     "params":{"status":"open",
     "after":"2017-01-04",
     "until":"2025-05-06",
        "limit":10,
        "symbols":"aapl",
        "direction":"asc",
        "nested":true,
        "side":"buy"
        }

  } */


  // 拎一隻

  /* {
    "endpoint": "/orders",
    "email":"example@gmail.com",
    "mode":"paper",
"id":"3e8ac918-18d0-4170-a79a-1ca5788aa814",
     "params":{"nested":false
        }

  }  */

  } 

  async patchData(body:AlpacaRequestDto) {
    const {endpoint, email, mode, params, id } = body
    const {authHeaders, apiUrl} = await this.getApiEndPoint(  email, mode, endpoint, params,id, 'patch');
    console.log(apiUrl)

    try {
      const response = await axios.patch(apiUrl, 
        params,
        authHeaders,
      );
    
      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 更改order, accept左既唔得

    /* {
        "endpoint": "/orders",
        "email":"example@gmail.com",
        "mode":"paper",
        "id":"3e8ac918-18d0-4170-a79a-1ca5788aa814",
         "params":{"qty": 1, "time_in_force": "day", "limit_price": 181, "stop_price": 175}
    
      }  */
  }

  

  async deleteData(body:AlpacaRequestDto) {
    const {endpoint, email, mode, params, id } = body
    const {authHeaders, apiUrl} = await this.getApiEndPoint(  email, mode, endpoint, params, id, "delete");

    console.log(apiUrl)

    try {
      const response = await axios.delete(apiUrl, 
        authHeaders
      );
    
      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // delete one id and legs
  /* {
    "endpoint": "/orders",
    "email":"example@gmail.com",
    "mode":"paper",
    "id":"3e8ac918-18d0-4170-a79a-1ca5788aa814",
  }  */

  // delete all id
  /* {
    "endpoint": "/orders",
    "email":"example@gmail.com",
    "mode":"paper",
  }  */

  // delete 一隻
  /* {
    "endpoint": "/positions",
    "email":"example@gmail.com",
    "mode":"paper",
    "id":"35f33a69-f5d6-4dc9-b158-4485e5e92e4b",
    "params":{
        "qty":0.1
        
    }

  }  */
  
}

