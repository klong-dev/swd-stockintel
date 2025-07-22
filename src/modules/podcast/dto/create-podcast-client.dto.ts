import { IsNotEmpty, IsString, IsOptional, IsEmail, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePodcastClientDto {
    @ApiProperty({
        description: 'Name of the podcast client application',
        example: 'My Podcast App'
    })
    @IsNotEmpty()
    @IsString()
    clientName: string;

    @ApiPropertyOptional({
        description: 'Maximum storage in MB for this client',
        example: 1000,
        default: 500
    })
    @IsOptional()
    @IsNumber()
    maxStorageMb?: number;

    @ApiPropertyOptional({
        description: 'Maximum file size in MB per upload',
        example: 100,
        default: 50
    })
    @IsOptional()
    @IsNumber()
    maxFileSizeMb?: number;

    @ApiPropertyOptional({
        description: 'Allowed audio file formats',
        example: ['mp3', 'wav', 'm4a'],
        default: ['mp3', 'wav']
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allowedFormats?: string[];

    @ApiPropertyOptional({
        description: 'Rate limit per hour for API requests',
        example: 100,
        default: 60
    })
    @IsOptional()
    @IsNumber()
    rateLimitPerHour?: number;

    @ApiPropertyOptional({
        description: 'Contact email for the client',
        example: 'contact@mypodcastapp.com'
    })
    @IsOptional()
    @IsEmail()
    contactEmail?: string;

    @ApiPropertyOptional({
        description: 'Description of the podcast client application',
        example: 'Mobile app for uploading and managing podcasts'
    })
    @IsOptional()
    @IsString()
    description?: string;
}
