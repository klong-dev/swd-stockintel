import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {
    @ApiPropertyOptional({
        description: 'Cloudinary image URL for the post',
        type: 'string',
        example: 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/posts/abc123.jpg',
    })
    sourceUrl?: string;

    @ApiPropertyOptional({
        type: 'string',
        format: 'binary',
        description: 'Optional image file to update the post image (Cloudinary upload)',
    })
    file?: any;
}