import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMessage = exception instanceof Error ? exception.message : 'Internal server error';

    console.error(`[Server Error]: ${errorMessage}`);

    // 確認 global.win 存在且其 webContents 也存在
    if (global.win && !global.win.isDestroyed()) {
      global.win.webContents.send('error-message', { level: 'error', message: errorMessage });
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: errorMessage
    });
  }
}
