import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateStockDto {
    @ApiProperty({ description: 'Stock symbol' })
    @IsString()
    symbol: string;

    @ApiProperty({ description: 'Company name' })
    @IsString()
    companyName: string;

    @ApiPropertyOptional({ description: 'ID of the stock exchange' })
    @IsOptional()
    @IsInt()
    stockExchangeId?: number;
}