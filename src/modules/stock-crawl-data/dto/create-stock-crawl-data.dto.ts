import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsDateString, IsNumber, IsString } from 'class-validator';

export class CreateStockCrawlDataDto {
    @ApiProperty({ description: 'ID of the stock' })
    @IsInt()
    stockId: number;

    @ApiProperty({ description: 'Date of the crawl (ISO string)' })
    @IsDateString()
    crawlDate: string;

    @ApiPropertyOptional({ description: 'Trading volume' })
    @IsOptional()
    @IsNumber()
    volume?: number;

    @ApiPropertyOptional({ description: 'Reference price' })
    @IsOptional()
    @IsNumber()
    refPrice?: number;

    @ApiPropertyOptional({ description: 'Ceiling price' })
    @IsOptional()
    @IsNumber()
    ceilPrice?: number;

    @ApiPropertyOptional({ description: 'Floor price' })
    @IsOptional()
    @IsNumber()
    floorPrice?: number;

    @ApiPropertyOptional({ description: 'Opening price' })
    @IsOptional()
    @IsNumber()
    openPrice?: number;

    @ApiPropertyOptional({ description: 'Highest price' })
    @IsOptional()
    @IsNumber()
    highPrice?: number;

    @ApiPropertyOptional({ description: 'Lowest price' })
    @IsOptional()
    @IsNumber()
    lowPrice?: number;

    @ApiPropertyOptional({ description: 'Foreign buy volume' })
    @IsOptional()
    @IsNumber()
    foreignBuyVolume?: number;

    @ApiPropertyOptional({ description: 'Foreign sell volume' })
    @IsOptional()
    @IsNumber()
    foreignSellVolume?: number;

    @ApiPropertyOptional({ description: 'Foreign buy value' })
    @IsOptional()
    @IsNumber()
    foreignBuyValue?: number;

    @ApiPropertyOptional({ description: 'Foreign sell value' })
    @IsOptional()
    @IsNumber()
    foreignSellValue?: number;

    @ApiPropertyOptional({ description: 'Foreign room left percent' })
    @IsOptional()
    @IsNumber()
    foreignRoomLeftPercent?: number;

    @ApiPropertyOptional({ description: 'EPS basic' })
    @IsOptional()
    @IsNumber()
    epsBasic?: number;

    @ApiPropertyOptional({ description: 'EPS diluted' })
    @IsOptional()
    @IsNumber()
    epsDiluted?: number;

    @ApiPropertyOptional({ description: 'Price to earnings ratio' })
    @IsOptional()
    @IsNumber()
    pe?: number;

    @ApiPropertyOptional({ description: 'Book value' })
    @IsOptional()
    @IsNumber()
    bookValue?: number;

    @ApiPropertyOptional({ description: 'Price to book ratio' })
    @IsOptional()
    @IsNumber()
    pb?: number;
}