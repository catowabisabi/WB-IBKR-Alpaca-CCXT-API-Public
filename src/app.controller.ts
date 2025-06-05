import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiExcludeController, ApiExcludeEndpoint } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get Hello message (method 1)' })
  @ApiResponse({ status: 200, description: 'Returns hello string', type: String })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("/")
  @ApiOperation({ summary: 'Get Hello message (method 1)' })
  @ApiResponse({ status: 200, description: 'Returns hello string', type: String })
  getHello2(): string {
    console.log('2')
    return this.appService.getHello();
  }
}
