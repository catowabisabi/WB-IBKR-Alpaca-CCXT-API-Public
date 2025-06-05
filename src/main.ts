// 匯入 NestJS 用來啟動應用程式的工廠函數
// Import the NestJS function to bootstrap the application
import { NestFactory } from '@nestjs/core';

// 匯入你自己的主模組（所有功能模組的總入口）
// Import your app's main module (the entry point of all modules)
import { AppModule } from './app.module';

// 匯入 NestJS 的全域驗證管道，用來驗證輸入資料是否正確
// Import NestJS's global validation pipe to check incoming request data
import { ValidationPipe } from '@nestjs/common';

// 匯入 dotenv 套件，用來載入 .env 檔案中的環境變數
// Import dotenv to load environment variables from .env file
import * as dotenv from 'dotenv';

// 匯入自訂的錯誤處理器，用來處理 IBKR 模組的錯誤
// Import a custom error handler for the IBKR module
import { IbkrExceptionFilter } from './ibkr/ibkr.exception-filter';

// ✅ 新增：Swagger 相關
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AllExceptionsFilter } from './all-exceptions-filter/all-exceptions-filter.filter';
import { AllExceptionsFilterService } from './all-exceptions-filter/all-exceptions-filter.service';


// 讀取 .env 環境設定檔（放在專案根目錄）
// Load .env file (located in the root folder)
dotenv.config({ path: '.env' });


// main.ts 裡加入這些防止 Node.js 層級的 crash
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // 可選：發通知、log、清理資源等
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // 同樣：log / 發警報
});

// 程式進入點（啟動函數）
// This is the main function that starts the application
async function bootstrap() {
  // 建立 NestJS 應用，並使用 AppModule 作為主模組
  // Create the NestJS application with AppModule
  const app = await NestFactory.create(AppModule);
 

  // 使用全域的資料驗證管道（讓每個請求都自動驗證資料是否正確）
  // Use a global validation pipe to automatically check incoming request data
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // 自動移除非 DTO 中定義的屬性
                     // Automatically remove properties not defined in the DTO

    transform: true, // 自動將輸入的字串轉型為對應的型別（例如數字）
                     // Automatically convert strings into proper types (e.g., numbers)

    forbidNonWhitelisted: true, // 如果有非 DTO 定義的屬性會拋出錯誤
                                // Throw an error if request contains unexpected properties

    transformOptions: {
      enableImplicitConversion: true, // 允許自動轉型（例如 '123' 變成 123）
                                      // Allow implicit type conversion (e.g., '123' to 123)
    }
  }));

  // 設定全域錯誤過濾器，用來捕捉並處理特定錯誤
  // Use a global error filter to catch and handle specific exceptions
  app.useGlobalFilters(
    new IbkrExceptionFilter(),
    new AllExceptionsFilter() 
    
  );

  // （可選）這裡你可以全域使用權限驗證機制（尚未啟用）
  // (Optional) Use global authentication guard (currently commented out)
  // app.useGlobalGuards(new JwtAuthGuard());

  // ✅ 新增：Swagger 相關// ✅ 新增：Swagger 設定
  const config = new DocumentBuilder()
    .setTitle('WealthBehave AutoTrader API')
    .setDescription('WealthBehave 交易伺服器 API 文件')
    .setVersion('0.0.2')
    .addTag('trading')
    .addApiKey(
      { type: 'apiKey', name: 'X-API-Key', in: 'header' },
      'X-API-Key', // 這是 key 的名稱，要跟 guard 裡讀的對上
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },'JWT-auth' // 這裡要有名稱
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {swaggerOptions: {
      persistAuthorization: true, // 保留使用者輸入的 token
    },}
  );

  // 設定應用程式監聽的 Port（端口）
  // Define the port the server will listen on
  const port = 3824;

  // 啟動伺服器，監聽指定的 port
  // Start the server and listen on the specified port
  await app.listen(port);

  // 在終端機輸出伺服器啟動訊息
  // Print a message to the terminal once the server is running
  console.log("正在運行 WealthBehave Trading Server... Connection Port: " + port);
  console.log("Swagger 文件已啟用於：http://localhost:" + port + "/api");
}

// 執行啟動函數
// Run the bootstrap function
bootstrap();

/*
{
  "symbol": "AAPL",          // 股票代碼（如 Apple）
  "secType": "STK",          // 證券類型（STK = 股票）
  "currency": "USD",         // 貨幣
  "exchange": "SMART",       // 交易所
  "action": "BUY",           // 動作（買入）
  "orderType": "LMT",        // 訂單類型（限價單）
  "totalQuantity": 1,        // 數量
  "price": 145.50            // 限價價格
}
  */