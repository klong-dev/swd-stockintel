import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
    ) { }

    async create(createReportDto: CreateReportDto, user: any) {
        try {
            const report = this.reportRepository.create({
                ...createReportDto,
                userId: user.userId,
            });
            const data = await this.reportRepository.save(report);
            return {
                error: false,
                data,
                message: 'Report created successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to create report',
            };
        }
    }

    async findAll() {
        try {
            const data = await this.reportRepository.find();
            return {
                error: false,
                data,
                message: 'All reports fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch reports',
            };
        }
    }

    async findOne(id: number) {
        try {
            const data = await this.reportRepository.findOne({ where: { reportId: id } });
            return {
                error: false,
                data,
                message: 'Report fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch report',
            };
        }
    }

    async update(id: number, updateReportDto: UpdateReportDto, user: any) {
        try {
            const report = await this.reportRepository.findOne({ where: { reportId: id } });
            if (!report) return { error: true, data: null, message: 'Report not found' };
            if (report.userId !== user.userId) return { error: true, data: null, message: 'You can only update your own reports' };
            await this.reportRepository.update(id, updateReportDto);
            const data = await this.reportRepository.findOne({ where: { reportId: id } });
            return {
                error: false,
                data,
                message: 'Report updated successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to update report',
            };
        }
    }

    async remove(id: number, user: any) {
        try {
            const report = await this.reportRepository.findOne({ where: { reportId: id } });
            if (!report) return { error: true, data: null, message: 'Report not found' };
            if (report.userId !== user.userId) return { error: true, data: null, message: 'You can only delete your own reports' };
            const data = await this.reportRepository.delete(id);
            return {
                error: false,
                data,
                message: 'Report deleted successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to delete report',
            };
        }
    }
}
