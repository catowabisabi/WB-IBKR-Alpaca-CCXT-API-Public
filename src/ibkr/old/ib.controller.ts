import { Controller, Get } from '@nestjs/common';
import { IbService } from './ib.service';

@Controller('ib')
export class IbController {
  constructor(private readonly ibService: IbService) {}

  @Get('connect')
  async connectToIb(): Promise<string> {
    await this.ibService.connectToIb();
    return 'Connected to Interactive Brokers API';
  }
}