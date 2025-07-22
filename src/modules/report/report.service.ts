import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Report } from './entities/report.entity';
import { Post } from '../post/entities/post.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { RedisService } from 'src/modules/redis/redis.service';
import { paginate } from '../../utils/pagination';

@Injectable()
export class ReportService {
    private readonly redis;
    private readonly cachePrefix = 'reports';

    constructor(
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
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

    private async clearCachePattern(pattern: string): Promise<void> {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }

    async create(createReportDto: CreateReportDto, user: any) {
        try {
            const report = this.reportRepository.create({
                ...createReportDto,
                userId: user.userId,
            });
            const data = await this.reportRepository.save(report);

            // If reporting a post, increment the reportCount
            if (createReportDto.postId) {
                await this.postRepository.increment(
                    { postId: createReportDto.postId },
                    'reportCount',
                    1
                );
            }

            // Clear all related cache keys
            await this.clearCachePattern(`${this.cachePrefix}:*`);

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

    async findAll(page: number = 1, pageSize: number = 10): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const data = await this.reportRepository.find();
            const paginated = paginate(data, page, pageSize);
            return {
                error: false,
                data: paginated,
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

    async getReportedPosts(page: number = 1, pageSize: number = 10): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const [posts, total] = await this.postRepository.findAndCount({
                where: { reportCount: MoreThan(0) },
                order: { reportCount: 'DESC' },
                relations: ['expert', 'stock', 'reports'],
                skip: (page - 1) * pageSize,
                take: pageSize,
            });

            const paginatedData = {
                items: posts,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            };

            return {
                error: false,
                data: paginatedData,
                message: 'Reported posts fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch reported posts',
            };
        }
    }

    async rejectReportPost(postId: number): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const post = await this.postRepository.findOne({ where: { postId } });
            if (!post) {
                return {
                    error: true,
                    data: null,
                    message: 'Post not found',
                };
            }

            // Reset reportCount to 0
            await this.postRepository.update(postId, { reportCount: 0 });

            // Clear all related cache keys
            await this.clearCachePattern(`${this.cachePrefix}:*`);

            return {
                error: false,
                data: { postId, reportCount: 0 },
                message: 'Report rejected and post report count reset successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to reject report',
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
