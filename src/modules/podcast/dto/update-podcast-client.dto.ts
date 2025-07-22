import { PartialType } from '@nestjs/mapped-types';
import { CreatePodcastClientDto } from './create-podcast-client.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdatePodcastClientDto extends PartialType(CreatePodcastClientDto) {
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
