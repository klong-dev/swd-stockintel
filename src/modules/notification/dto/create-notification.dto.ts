import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateNotificationDto {
    @ApiProperty({ description: 'ID of the user to notify' })
    @IsString()
    userId: string;

    @ApiProperty({ description: 'Type of notification' })
    @IsString()
    type: string;

    @ApiPropertyOptional({ description: 'ID related to the notification (e.g., post, comment)' })
    @IsOptional()
    @IsInt()
    relatedId?: number;

    @ApiPropertyOptional({ description: 'Whether the notification has been read' })
    @IsOptional()
    @IsBoolean()
    isRead?: boolean;
}