import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { RedisService } from '../redis/redis.service';
import { paginate } from '../../utils/pagination';

@Injectable()
export class CommentService {
    private readonly redis;
    private readonly cachePrefix = 'comments';
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
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

    async create(createCommentDto: CreateCommentDto) {
        try {
            const comment = this.commentRepository.create(createCommentDto);
            const saved = await this.commentRepository.save(comment);
            await this.removeFromCache(`${this.cachePrefix}:all`);
            await this.removeFromCache(`${this.cachePrefix}:${saved.commentId}`);
            return {
                error: false,
                data: saved,
                message: 'Comment created successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to create comment',
            };
        }
    }

    async findAll(page: number = 1, pageSize: number = 10): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const data = await this.commentRepository.find({
                relations: ['user']
            });
            const sanitized = data.map(comment => {
                if (comment.user) {
                    const { passwordHash, ...userWithoutPassword } = comment.user;
                    return { ...comment, user: userWithoutPassword };
                }
                return comment;
            });
            const paginated = paginate(sanitized, page, pageSize);
            return {
                error: false,
                data: paginated.data,
                message: 'All comments fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch comments',
            };
        }
    }

    async findOne(id: number) {
        try {
            const cacheKey = `${this.cachePrefix}:${id}`;
            const cached = await this.getFromCache<Comment>(cacheKey);
            if (cached) return { error: false, data: cached, message: 'Comment fetched from cache' };
            const result = await this.commentRepository.findOne({ where: { commentId: id } });
            if (result) await this.setToCache(cacheKey, result);
            return {
                error: false,
                data: result,
                message: result ? 'Comment fetched successfully' : 'Comment not found',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch comment',
            };
        }
    }

    async update(id: number, updateCommentDto: UpdateCommentDto) {
        try {
            await this.commentRepository.update(id, updateCommentDto);
            await this.removeFromCache(`${this.cachePrefix}:all`);
            await this.removeFromCache(`${this.cachePrefix}:${id}`);
            const updated = await this.commentRepository.findOne({ where: { commentId: id } });
            return {
                error: false,
                data: updated,
                message: 'Comment updated successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to update comment',
            };
        }
    }

    async remove(id: number) {
        try {
            const result = await this.commentRepository.delete(id);
            await this.removeFromCache(`${this.cachePrefix}:all`);
            await this.removeFromCache(`${this.cachePrefix}:${id}`);
            return {
                error: false,
                data: result,
                message: 'Comment deleted successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to delete comment',
            };
        }
    }
}
