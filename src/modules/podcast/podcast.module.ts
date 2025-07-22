import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PodcastService } from './podcast.service';
import { PodcastController } from './podcast.controller';
import { PodcastAdminController } from './podcast-admin.controller';
import { Podcast } from './entities/podcast.entity';
import { PodcastClient } from './entities/podcast-client.entity';
import { PodcastAuthGuard } from './guards/podcast-auth.guard';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { RedisModule } from '../redis/redis.module';
import { JwtConfigModule } from '../../configs/jwt-config.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Podcast, PodcastClient]),
        CloudinaryModule,
        RedisModule,
        JwtConfigModule,
    ],
    controllers: [PodcastController, PodcastAdminController],
    providers: [PodcastService, PodcastAuthGuard],
    exports: [PodcastService],
})
export class PodcastModule { }
