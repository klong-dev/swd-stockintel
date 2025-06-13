import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
    @ApiProperty({ description: 'Title of the post' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ description: 'Content of the post' })
    @IsOptional()
    @IsString()
    content?: string;

    @ApiPropertyOptional({ description: 'Related stock ID' })
    @IsOptional()
    @IsInt()
    stockId?: number;
}