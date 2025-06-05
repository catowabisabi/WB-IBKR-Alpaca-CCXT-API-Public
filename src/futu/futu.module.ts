import { Module } from '@nestjs/common';
import { FutuService } from './futu.service';
import { FutuController } from './futu.controller';

@Module({
  controllers: [FutuController],
  providers: [FutuService],
})
export class FutuModule {}
