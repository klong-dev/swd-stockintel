import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateCommentDto {
    @ApiPropertyOptional({ description: 'ID of the post being commented on' })
    @IsOptional()
    @IsInt()
    postId?: number;

    @ApiPropertyOptional({ description: 'ID of the user making the comment' })
    @IsOptional()
    @IsInt()
    userId?: number;

    @ApiPropertyOptional({ description: 'ID of the parent comment if this is a reply' })
    @IsOptional()
    @IsInt()
    parentCommentId?: number;

    @ApiProperty({ description: 'Content of the comment' })
    @IsString()
    content: string;

    @ApiPropertyOptional({ description: 'Whether the comment has been edited' })
    @IsOptional()
    @IsBoolean()
    isEdited?: boolean;

    @ApiPropertyOptional({ description: 'Number of likes for the comment' })
    @IsOptional()
    @IsInt()
    likeCount?: number;
}