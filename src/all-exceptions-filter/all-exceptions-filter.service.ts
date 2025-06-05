// 用來統一記錄 log、錯誤通知等
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AllExceptionsFilterService {
  private readonly logger = new Logger(AllExceptionsFilterService.name);

  logError(exception: any) {
    this.logger.error(exception.message, exception.stack);
  }
}
