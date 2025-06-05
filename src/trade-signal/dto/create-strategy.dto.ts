import { Expose } from 'class-transformer';

export class CreateStrategyDto {
  @Expose({ name: 'strategy' })
  strategy: string;

  @Expose({ name: 'strategyInfo' })
  strategyInfo: string;

  @Expose({ name: 'strategyTimeFrame' })
  strategyTimeFrame: string;
}