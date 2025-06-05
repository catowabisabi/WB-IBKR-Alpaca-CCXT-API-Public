import { Controller, Post, Body, Get, Query, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { AlpacaService } from './alpaca.service';
import { AlpacaRequestDto } from './dto/alpaca-request.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt_auth.guard';

@UseGuards(JwtAuthGuard) // 使用 JWT 驗證保護整個控制器 / Use JWT auth guard to protect all routes
@Controller('alpaca') // 路由前綴為 /alpaca / Prefix all routes with /alpaca
export class AlpacaController {
  constructor(private readonly alpacaService: AlpacaService) {}

  // 檢查使用者身份是否一致 / Check if the requester's email matches the payload
  checkAuth(body: AlpacaRequestDto, req) {
    return body.email == req.user.email;
  }

  // POST /alpaca/data-advance
  // 用來提交高級數據操作 / Submit advanced data processing
  @Post('data-advance')
  async postDataAdvance(@Body() body: AlpacaRequestDto, @Request() req) {
    if (this.checkAuth(body, req)) {
      return await this.alpacaService.postDataAdvance(body);
    } else {
      return { error: "User mismatch." }; // 錯誤：使用者不一致 / Error: user mismatch
    }
  }

  // POST /alpaca/data
  // 用來提交一般數據操作 / Submit basic data processing
  @Post('data')
  async postData(@Body() body: AlpacaRequestDto, @Request() req) {
    if (this.checkAuth(body, req)) {
      return await this.alpacaService.postData(body);
    } else {
      return { error: "User mismatch." };
    }
  }

  // GET /alpaca/data
  // 用來取得資料（只能用 Query 傳參） / Retrieve data (parameters via query string)
  @Get('data')
  async getData(@Query() body: any, @Request() req) {
    if (this.checkAuth(body, req)) {
      return await this.alpacaService.getData(body);
    } else {
      return { error: "User mismatch." };
    }
  }

  // PATCH /alpaca/data
  // 用來更新資料 / Update data
  @Patch('data')
  async patchData(@Body() body: AlpacaRequestDto, @Request() req) {
    if (this.checkAuth(body, req)) {
      return await this.alpacaService.patchData(body);
    } else {
      return { error: "User mismatch." };
    }
  }

  // DELETE /alpaca/data
  // 用來刪除資料 / Delete data
  @Delete('data')
  async deleteData(@Body() body: AlpacaRequestDto, @Request() req) {
    if (this.checkAuth(body, req)) {
      return await this.alpacaService.deleteData(body);
    } else {
      return { error: "User mismatch." };
    }
  }

  // POST /alpaca/orders
  // 處理下單邏輯（暫時用 getData 方法處理） / Handle order placement (uses getData for now)
  @Post('orders')
  async postOrders(@Query() body: any, @Request() req) {
    const userEmail = req.user.email;
    if (userEmail != body.email) {
      return { error: "User mismatch." };
    }
    return await this.alpacaService.getData(body);
  }

  // 以下為測試用 API（test endpoints for debugging）

  // GET /alpaca/test
  @Get('test')
  async getTest(@Query() query: any, @Request() req) {
    console.log(query);      // 印出查詢參數 / Log query parameters
    console.log(req.body);   // 通常為空，因 GET 沒有 body / Usually empty
  }

  // POST /alpaca/test
  @Post('test')
  async postTest(@Body() body: any, @Request() req) {
    console.log(body);       // 印出請求內容 / Log request body
    console.log(req.body);   // 相同於 body
  }

  // PATCH /alpaca/test
  @Patch('test')
  async patchTest(@Body() body: any, @Request() req) {
    console.log(body);
    console.log(req.body);
  }

  // DELETE /alpaca/test
  @Delete('test')
  async deleteTest(@Body() body: any, @Request() req) {
    console.log(body);
    console.log(req.body);
  }
}
