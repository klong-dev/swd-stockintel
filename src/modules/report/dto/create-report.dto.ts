import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateReportDto {
    @ApiPropertyOptional({ description: 'ID of the post being reported' })
    @IsOptional()
    @IsInt()
    postId?: number;

    @ApiPropertyOptional({ description: 'ID of the comment being reported' })
    @IsOptional()
    @IsInt()
    commentId?: number;

    @ApiProperty({ description: 'Reason for the report' })
    @IsString()
    reason: string;

    @ApiPropertyOptional({ description: 'Status of the report' })
    @IsOptional()
    @IsString()
    status?: string;
}