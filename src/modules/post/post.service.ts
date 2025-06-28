import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { RedisService } from 'src/modules/redis/redis.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class PostService {
    private readonly redis;
    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        private readonly redisService: RedisService,
        private readonly cloudinaryService: CloudinaryService,
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

    async create(createPostDto: CreatePostDto, user: any, sourceBuffer?: Buffer) {
        let sourceUrl = null;
        if (sourceBuffer) {
            sourceUrl = await this.cloudinaryService.uploadImageFromBuffer(sourceBuffer, 'posts');
        }
        const post = this.postRepository.create({
            ...createPostDto,
            expertId: user.userId,
            sourceUrl,
        });
        const saved = await this.postRepository.save(post);
        await this.removeFromCache('posts:all');
        await this.removeFromCache(`posts:${saved.postId}`);
        return saved;
    }

    async findAll() {
        const cacheKey = 'posts:all';
        const cached = await this.getFromCache<Post[]>(cacheKey);
        if (cached) return cached;
        const result = await this.postRepository.find();
        await this.setToCache(cacheKey, result);
        return result;
    }

    async findOne(id: number) {
        const cacheKey = `posts:${id}`;
        const cached = await this.getFromCache<Post>(cacheKey);
        if (cached) return cached;
        const result = await this.postRepository.findOne({ where: { postId: id } });
        if (result) await this.setToCache(cacheKey, result);
        return result;
    }

    async update(id: number, updatePostDto: UpdatePostDto, user: any, sourceBuffer?: Buffer) {
        const post = await this.postRepository.findOne({ where: { postId: id } });
        if (!post) throw new NotFoundException('Post not found');
        if (post.expertId !== user.userId) throw new ForbiddenException('You can only update your own posts');
        let sourceUrl = updatePostDto.sourceUrl;
        if (sourceBuffer) {
            sourceUrl = await this.cloudinaryService.uploadImageFromBuffer(sourceBuffer, 'posts');
        }
        await this.postRepository.update(id, { ...updatePostDto, sourceUrl });
        await this.removeFromCache('posts:all');
        await this.removeFromCache(`posts:${id}`);
        return this.findOne(id);
    }

    async remove(id: number, user: any) {
        const post = await this.postRepository.findOne({ where: { postId: id } });
        if (!post) throw new NotFoundException('Post not found');
        if (post.expertId !== user.userId) throw new ForbiddenException('You can only delete your own posts');
        const result = await this.postRepository.delete(id);
        await this.removeFromCache('posts:all');
        await this.removeFromCache(`posts:${id}`);
        return result;
    }
}
