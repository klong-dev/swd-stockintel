import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateStockExchangeDto } from './create-stock-exchange.dto';

export class UpdateStockExchangeDto extends PartialType(CreateStockExchangeDto) {
    // All properties are already documented in CreateStockExchangeDto
}