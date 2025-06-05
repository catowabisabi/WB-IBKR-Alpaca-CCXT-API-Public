// ./src/app.module.ts

// 從 NestJS 載入 Module 裝飾器，用來定義一個模組
// Import the Module decorator from NestJS to define a module
import { Module } from '@nestjs/common';

// 引入其他子模組，這些模組提供不同功能
// Import various feature modules that provide different functionalities
import { TradeSignalModule } from './trade-signal/trade-signal.module';
import { ExchangesModule } from './exchanges/exchanges.module';
import { ConfigurationModule } from './config/config.module';
import { IbkrModule } from './ibkr/ibkr.module';
import { MongodbModule } from './mongodb/mongodb.module';
import { UsersModule } from './users/users.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { UserValidationModule } from './user-validation/user-validation.module';
// import { AllExceptionsFilterModule } from './all-exceptions-filter/all-exceptions-filter.module'; // 這個目前註解掉

import { AppGateway } from './app.gateway';  // WebSocket 網關
import { AuthModule } from './auth/auth.module'; // 認證模組
// import { ApiEnvModule } from './api-env/api-env.module';
// import { TelegramModule } from './telegram/telegram.module';  // 之前註解掉的 Telegram 模組
import { WebhookModule } from './webhook/webhook.module';  // Webhook 模組
import { MyGateway } from './my.gateway';  // 另一個 WebSocket 網關
import { AlpacaModule } from './alpaca/alpaca.module';  // Alpaca 交易模組
import { AppController } from './app.controller';  // 主控制器（Controller）
import { AppService } from './app.service';  // 主服務（Service）

// 引入節流套件（用於限制請求頻率，防止被攻擊）
// Import throttler module to limit request rate (protect against abuse)
import { ThrottlerModule } from '@nestjs/throttler';

import { TelegramModule } from './telegram/telegram.module';  // Telegram 功能模組
import { AllExceptionsFilterModule } from './all-exceptions-filter/all-exceptions-filter.module';



@Module({
  //imports: [TradeSignalModule, FutuModule, ExchangesModule],//這3個module在測試ccxt時有用
  // imports 陣列用來註冊所有子模組，讓 AppModule 知道這些功能都存在
  // The imports array registers all feature modules, so AppModule knows what features exist
  imports: [
    ThrottlerModule.forRoot([{  // 配置節流（限流）功能
      ttl: 60,       // 時間窗口（秒），例如 60 秒內
      limit: 10,     // 最大請求數，例如 10 次請求
    }]),
    AllExceptionsFilterModule,
    UsersModule,          // 使用者功能模組
    TradeSignalModule,    // 交易訊號模組
    ExchangesModule,      // 交易所管理模組
    ConfigurationModule,  // 配置設定模組
    IbkrModule,           // IBKR 交易模組（Interactive Brokers）
    MongodbModule,        // MongoDB 數據庫模組
    UserSettingsModule,   // 使用者設定模組
    UserValidationModule, // 使用者驗證模組
    /* AllExceptionsFilterModule, */  // 全域錯誤過濾模組，暫時註解掉
    AuthModule,           // 認證與授權模組
    /* ApiEnvModule, */    // API 環境變數模組，註解掉
    WebhookModule,        // Webhook 模組
    AlpacaModule,         // Alpaca 交易模組
    TelegramModule        // Telegram 功能模組
  ],

  // providers 用來註冊服務，讓 NestJS 知道這些服務可以被注入使用
  // The providers array registers services, so NestJS can inject them where needed
  providers: [
    AppService,    // 主服務（AppService）
    // 下面是註解掉的全域錯誤過濾器註冊
    /* {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    }, */
    AppGateway,   // WebSocket 網關服務
    MyGateway     // 另一個 WebSocket 網關服務
  ],

  // controllers 陣列告訴 NestJS，哪些控制器負責處理 HTTP 請求
  // The controllers array tells NestJS which controllers handle HTTP requests
  controllers: [AppController], 
})

export class AppModule {}  // 導出 AppModule 作為整個應用的主模組