import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { Report } from './entities/report.entity';
import { Post } from '../post/entities/post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtConfigModule } from 'src/configs/jwt-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, Post]),
    JwtConfigModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule { }
