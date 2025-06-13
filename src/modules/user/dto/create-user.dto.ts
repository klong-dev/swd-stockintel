import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ description: 'User email address' })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ description: 'Password hash' })
    @IsOptional()
    @IsString()
    passwordHash?: string;

    @ApiPropertyOptional({ description: 'Full name of the user' })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiPropertyOptional({ description: 'Avatar URL' })
    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @ApiPropertyOptional({ description: 'OAuth provider' })
    @IsOptional()
    @IsString()
    provider?: string;

    @ApiPropertyOptional({ description: 'Social ID from provider' })
    @IsOptional()
    @IsString()
    socialId?: string;

    @ApiPropertyOptional({ description: 'User status' })
    @IsOptional()
    @IsString()
    status?: string;
}