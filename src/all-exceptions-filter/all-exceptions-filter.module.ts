// all-exceptions-filter.module.ts
import { Module } from '@nestjs/common';
import { AllExceptionsFilterService } from './all-exceptions-filter.service';

@Module({
  providers: [AllExceptionsFilterService],
  exports: [AllExceptionsFilterService],
})
export class AllExceptionsFilterModule {}
