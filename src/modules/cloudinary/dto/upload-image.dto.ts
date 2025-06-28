import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadImageDto {
    @ApiProperty({ type: 'string', format: 'binary', description: 'Image file' })
    file: any;

    @ApiProperty({ example: 'products', required: false })
    @IsOptional()
    @IsString()
    folder?: string;
}
