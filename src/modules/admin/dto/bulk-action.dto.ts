import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AdminUpdatePostDto } from './admin-update-post.dto';

export class BulkUpdatePostDto {
    @ApiProperty({ description: 'Array of post IDs to update', type: [Number] })
    @IsArray()
    postIds: number[];

    @ApiProperty({ description: 'Update data to apply to all posts', type: AdminUpdatePostDto })
    @ValidateNested()
    @Type(() => AdminUpdatePostDto)
    updateData: AdminUpdatePostDto;
}

export class BulkDeletePostDto {
    @ApiProperty({ description: 'Array of post IDs to delete', type: [Number] })
    @IsArray()
    postIds: number[];
}
