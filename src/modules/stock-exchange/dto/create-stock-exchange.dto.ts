import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateStockExchangeDto {
    @ApiProperty({ description: 'Name of the stock exchange' })
    @IsString()
    name: string;
}