import { Expose } from 'class-transformer';

export class CreateAuthDto {
  @Expose({ name: 'AID' })
  AID: string;

  @Expose({ name: 'apiSec' })
  apiSec: string;
}