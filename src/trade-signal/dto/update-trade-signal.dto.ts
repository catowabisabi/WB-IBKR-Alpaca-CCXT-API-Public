import { PartialType } from '@nestjs/mapped-types';
import { CreateTradeSignalDto } from './create-trade-signal.dto';

export class UpdateTradeSignalDto extends PartialType(CreateTradeSignalDto) {}
