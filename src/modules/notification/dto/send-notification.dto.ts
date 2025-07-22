import { IsNotEmpty, IsString, IsOptional, IsObject, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendNotificationDto {
    @ApiProperty({
        description: 'Notification title',
        example: 'New Post Available!'
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Notification body',
        example: 'Check out the latest analysis on VCB stock performance'
    })
    @IsNotEmpty()
    @IsString()
    body: string;

    @ApiPropertyOptional({
        description: 'Additional data to send with notification',
        example: {
            type: 'new_post',
            postId: 123,
            url: '/posts/123'
        }
    })
    @IsOptional()
    @IsObject()
    data?: {
        type?: string;
        postId?: number;
        url?: string;
        [key: string]: any;
    };

    @ApiPropertyOptional({
        description: 'Specific user IDs to send to (if not provided, sends to all)',
        example: [1, 2, 3]
    })
    @IsOptional()
    @IsArray()
    userIds?: string[];

    @ApiPropertyOptional({
        description: 'Notification type',
        example: 'new_post'
    })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiPropertyOptional({
        description: 'Sound to play with notification',
        example: 'default'
    })
    @IsOptional()
    @IsString()
    sound?: string;

    @ApiPropertyOptional({
        description: 'Badge count for app icon',
        example: 1
    })
    @IsOptional()
    badge?: number;

    @ApiPropertyOptional({
        description: 'Channel ID for Android notifications',
        example: 'default'
    })
    @IsOptional()
    @IsString()
    channelId?: string;
}
