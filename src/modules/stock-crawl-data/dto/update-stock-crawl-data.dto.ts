import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateStockCrawlDataDto } from './create-stock-crawl-data.dto';

export class UpdateStockCrawlDataDto extends PartialType(CreateStockCrawlDataDto) {
    // All properties are already documented in CreateStockCrawlDataDto
}