import { Controller, Get,UseGuards } from '@nestjs/common';
import { FutuService } from './futu.service';
import { AdminApiKeyGuard } from 'src/guards/app-api-key.guard';
import { ApiSecurity, ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@ApiSecurity('X-API-Key')
@UseGuards(AdminApiKeyGuard)
@Controller('futu')
export class FutuController {
  constructor(private futuService: FutuService) {}

  /* @Get('account-list')
  getAccountList() {
    return this.futuService.connectAndFetch();
  } */
}