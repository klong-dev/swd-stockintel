import { IsOptional, IsString, IsInt, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminCreatePostDto {
    @ApiProperty({ description: 'Title of the post' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Content of the post', required: false })
    @IsOptional()
    @IsString()
    content?: string;

    @ApiProperty({ description: 'Expert ID who created the post', required: false })
    @IsOptional()
    @IsInt()
    @Min(1)
    expertId?: number;

    @ApiProperty({ description: 'Stock ID associated with the post', required: false })
    @IsOptional()
    @IsInt()
    @Min(1)
    stockId?: number;

    @ApiProperty({ description: 'Source URL of the post', required: false })
    @IsOptional()
    @IsString()
    sourceUrl?: string;

    @ApiProperty({ description: 'View count of the post', required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    viewCount?: number;

    @ApiProperty({ description: 'Like count of the post', required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    likeCount?: number;

    @ApiProperty({ description: 'Session number', required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    session?: number;
}
