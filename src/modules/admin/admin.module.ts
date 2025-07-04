import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Post } from '../post/entities/post.entity';
import { Report } from '../report/entities/report.entity';
import { RedisModule } from '../redis/redis.module';
import { JwtConfigModule } from '../../configs/jwt-config.module';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Report]),
    RedisModule,
    JwtConfigModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, JwtAuthGuard],
  exports: [AdminService],
})
export class AdminModule { }
