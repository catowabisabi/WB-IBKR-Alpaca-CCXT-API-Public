import { Expose } from 'class-transformer';

export class CreatePositionStateDto {
  //@Expose({ name: '當前倉位狀態' })
  @Expose({ name: 'positionNow' })
  positionNow: string;

  @Expose({ name: 'priceOfPositionNow' })
  priceOfPositionNow: number;

  @Expose({ name: 'positiionBefore' })
  positiionBefore: string;

  @Expose({ name: 'priceOfPositionBefore' })
  priceOfPositionBefore: number;
}