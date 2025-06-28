import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { RedisService } from 'src/modules/redis/redis.service';

@Injectable()
export class ReportService {
    private readonly redis;
    constructor(
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
        private readonly redisService: RedisService,
    ) {
        this.redis = this.redisService.getClient();
    }

    private async getFromCache<T>(key: string): Promise<T | null> {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
    }

    private async setToCache(key: string, value: any, ttl = 60): Promise<void> {
        await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    }

    private async removeFromCache(key: string): Promise<void> {
        await this.redis.del(key);
    }

    create(createReportDto: CreateReportDto, user: any) {
        const report = this.reportRepository.create({
            ...createReportDto,
            userId: user.userId,
        });
        return this.reportRepository.save(report);
    }

    findAll() {
        return this.reportRepository.find();
    }

    findOne(id: number) {
        return this.reportRepository.findOne({ where: { reportId: id } });
    }

    async update(id: number, updateReportDto: UpdateReportDto, user: any) {
        const report = await this.reportRepository.findOne({ where: { reportId: id } });
        if (!report) throw new NotFoundException('Report not found');
        if (report.userId !== user.userId) throw new ForbiddenException('You can only update your own reports');
        await this.reportRepository.update(id, updateReportDto);
        return this.findOne(id);
    }

    async remove(id: number, user: any) {
        const report = await this.reportRepository.findOne({ where: { reportId: id } });
        if (!report) throw new NotFoundException('Report not found');
        if (report.userId !== user.userId) throw new ForbiddenException('You can only delete your own reports');
        return this.reportRepository.delete(id);
    }
}
