import { Module } from '@nestjs/common';
import { ApiEnvService } from './api-env.service';
import { ApiEnvController } from './api-env.controller';

@Module({
  controllers: [ApiEnvController],
  providers: [ApiEnvService],
})
export class ApiEnvModule {}
