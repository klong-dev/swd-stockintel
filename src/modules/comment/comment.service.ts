import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { RedisService } from '../redis/redis.service';

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
        const comment = this.commentRepository.create(createCommentDto);
        const saved = await this.commentRepository.save(comment);
        await this.removeFromCache(`${this.cachePrefix}:all`);
        await this.removeFromCache(`${this.cachePrefix}:${saved.commentId}`);
        return saved;
    }

    async findAll() {
        const cacheKey = `${this.cachePrefix}:all`;
        const cached = await this.getFromCache<Comment[]>(cacheKey);
        if (cached) return cached;
        const result = await this.commentRepository.find();
        await this.setToCache(cacheKey, result);
        return result;
    }

    async findOne(id: number) {
        const cacheKey = `${this.cachePrefix}:${id}`;
        const cached = await this.getFromCache<Comment>(cacheKey);
        if (cached) return cached;
        const result = await this.commentRepository.findOne({ where: { commentId: id } });
        if (result) await this.setToCache(cacheKey, result);
        return result;
    }

    async update(id: number, updateCommentDto: UpdateCommentDto) {
        await this.commentRepository.update(id, updateCommentDto);
        await this.removeFromCache(`${this.cachePrefix}:all`);
        await this.removeFromCache(`${this.cachePrefix}:${id}`);
        return this.findOne(id);
    }

    async remove(id: number) {
        const result = await this.commentRepository.delete(id);
        await this.removeFromCache(`${this.cachePrefix}:all`);
        await this.removeFromCache(`${this.cachePrefix}:${id}`);
        return result;
    }
}
