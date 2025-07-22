import { IsNotEmpty, IsString, IsOptional, IsObject, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterExpoPushTokenDto {
    @ApiProperty({
        description: 'Expo push token',
        example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'
    })
    @IsNotEmpty()
    @IsString()
    token: string;

    @ApiPropertyOptional({
        description: 'Device information',
        example: {
            platform: 'ios',
            appVersion: '1.0.0',
            deviceModel: 'iPhone 13'
        }
    })
    @IsOptional()
    @IsObject()
    deviceInfo?: {
        platform?: string;
        appVersion?: string;
        deviceModel?: string;
    };
}
