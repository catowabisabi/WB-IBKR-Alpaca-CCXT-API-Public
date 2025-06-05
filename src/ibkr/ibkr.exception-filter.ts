// 匯入相關的 NestJS 模組與類別
// Import necessary NestJS classes and interfaces
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

// 匯入自定義的 IBKR 連線例外類別
// Import the custom IBKR connection exception class
import { IbkrConnectionException } from './ibkr-connection.exception';

// 使用 @Catch 裝飾器來指定要捕捉的例外類型（這裡是 IbkrConnectionException）
// Use the @Catch decorator to specify which exception to catch (IbkrConnectionException here)
@Catch(IbkrConnectionException)
export class IbkrExceptionFilter implements ExceptionFilter {

    // 當發生 IbkrConnectionException 時會觸發此方法
    // This method is triggered when an IbkrConnectionException is thrown
    catch(exception: IbkrConnectionException, host: ArgumentsHost) {

        // 從 context 中切換至 HTTP 請求上下文
        // Switch to HTTP context from the execution host
        const ctx = host.switchToHttp();

        // 取得 HTTP 回應對象（用來發送回應）
        // Get the HTTP response object to send the response
        const response = ctx.getResponse();

        // 回傳 HTTP 503（服務無法使用）狀態碼與錯誤訊息
        // Respond with HTTP 503 (Service Unavailable) and error message
        response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
            statusCode: HttpStatus.SERVICE_UNAVAILABLE, // 狀態碼為 503（Service Unavailable）
            message: exception.message || 'Unable to connect to IBKR TWS. Please check your connection and try again.',
            // 若 exception.message 有內容則使用，否則使用預設訊息
            // Use the exception's message if available, otherwise provide a default one
        });
    }
}
