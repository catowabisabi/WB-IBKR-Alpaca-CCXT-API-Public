import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateUserSettingsDto } from './create-user-settings.dto';

export class UpdateUserSettingsDto extends PartialType(CreateUserSettingsDto) {} 