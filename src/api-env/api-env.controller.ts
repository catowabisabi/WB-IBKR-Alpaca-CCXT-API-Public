import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiEnvService } from './api-env.service';
// 這個api是軟件用的, 現在已經沒有用
@Controller('api-env')
export class ApiEnvController {
  constructor(private readonly apiEnvService: ApiEnvService) {}

  /* @Get()
  getEnv() {
    return this.apiEnvService.getEnv();
  }

  @Post()
  setEnv(@Body() envData: Record<string, string>) {
    return this.apiEnvService.setEnv(envData);
  } */
}