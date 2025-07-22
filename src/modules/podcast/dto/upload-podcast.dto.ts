import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadPodcastDto {
    @ApiProperty({
        description: 'Title of the podcast',
        example: 'My First Podcast Episode'
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiPropertyOptional({
        description: 'Description of the podcast',
        example: 'This is an episode about technology and programming'
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Duration of the podcast in seconds',
        example: 1800
    })
    @IsOptional()
    @IsNumber()
    duration?: number;

    @ApiPropertyOptional({
        description: 'Status of the podcast',
        enum: ['draft', 'published', 'archived'],
        example: 'published',
        default: 'draft'
    })
    @IsOptional()
    @IsEnum(['draft', 'published', 'archived'])
    status?: 'draft' | 'published' | 'archived';

    @ApiPropertyOptional({
        description: 'Whether this podcast is featured',
        example: false,
        default: false
    })
    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @ApiPropertyOptional({
        description: 'Tags associated with the podcast',
        example: ['technology', 'programming', 'education'],
        type: [String]
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({
        description: 'Identifier of the uploader (external user ID, client name, etc.)',
        example: 'john_doe_123'
    })
    @IsOptional()
    @IsString()
    uploadedBy?: string;

    @ApiProperty({
        description: 'Secret key for authentication',
        example: 'sk_1234567890abcdef...'
    })
    @IsNotEmpty()
    @IsString()
    secretKey: string;
}
