import { Expose } from 'class-transformer';

export class CreateAccountDto {
  @Expose({ name: 'tradingRobot' })
  tradingRobot: string;

  @Expose({ name: 'account' })
  account: string;

  @Expose({ name: 'exchange' })
  exchange: string;
}