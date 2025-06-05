import { PartialType } from '@nestjs/mapped-types';
import { CreateFutuDto } from './create-futu.dto';

export class UpdateFutuDto extends PartialType(CreateFutuDto) {}
