import { IsOptional, IsString, IsInt, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AdminPostFilterDto {
    @ApiProperty({ description: 'Page number', required: false, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiProperty({ description: 'Page size', required: false, default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageSize?: number = 10;

    @ApiProperty({ description: 'Filter by status', required: false, enum: ['reported', 'active', 'hidden'] })
    @IsOptional()
    @IsString()
    @IsIn(['reported', 'active', 'hidden'])
    status?: string;

    @ApiProperty({ description: 'Search by title', required: false })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({ description: 'Filter by expert ID', required: false })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    expertId?: number;

    @ApiProperty({ description: 'Filter by stock ID', required: false })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    stockId?: number;

    @ApiProperty({ description: 'Sort by field', required: false, enum: ['createdAt', 'viewCount', 'likeCount'] })
    @IsOptional()
    @IsString()
    @IsIn(['createdAt', 'viewCount', 'likeCount'])
    sortBy?: string = 'createdAt';

    @ApiProperty({ description: 'Sort order', required: false, enum: ['ASC', 'DESC'] })
    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
