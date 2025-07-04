import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { RedisService } from 'src/modules/redis/redis.service';
import { paginate } from '../../utils/pagination';
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
            sourceUrl
        });
        const saved = await this.postRepository.save(post);
        await this.removeFromCache('posts:all');
        await this.removeFromCache(`posts:${saved.postId}`);
        try {
            return {
                error: false,
                saved,
                message: 'Post created successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to create post',
            };
        }
    }

    async findAll(page: number = 1, pageSize: number = 10): Promise<{ error: boolean; data: any; message: string }> {
        try {
            // Only get active posts (not deleted)
            const data = await this.postRepository.find({
                where: { status: 'active' },
                relations: ['tag', 'expert']
            });
            const paginated = paginate(data, page, pageSize);
            return {
                error: false,
                data: paginated,
                message: 'All posts fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch posts',
            };
        }
    }

    async findAllIncludingDeleted(page: number = 1, pageSize: number = 10): Promise<{ error: boolean; data: any; message: string }> {
        try {
            // Get all posts including deleted ones
            const data = await this.postRepository.find({
                relations: ['tag', 'expert']
            });
            const paginated = paginate(data, page, pageSize);
            return {
                error: false,
                data: paginated,
                message: 'All posts (including deleted) fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch posts',
            };
        }
    }

    async findDeletedPosts(page: number = 1, pageSize: number = 10): Promise<{ error: boolean; data: any; message: string }> {
        try {
            // Get only deleted posts
            const data = await this.postRepository.find({
                where: { status: 'deleted' },
                relations: ['tag', 'expert']
            });
            const paginated = paginate(data, page, pageSize);
            return {
                error: false,
                data: paginated,
                message: 'Deleted posts fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch deleted posts',
            };
        }
    }

    async findTopViewed(size: number = 10): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const data = await this.postRepository.find({
                where: { status: 'active' },
                order: { viewCount: 'DESC' },
                take: size,
                relations: ['tag', 'expert']
            });
            return {
                error: false,
                data: data,
                message: 'Top viewed posts fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch posts',
            };
        }
    }

    async findOne(id: number) {
        try {
            const cacheKey = `posts:${id}`;
            const cached = await this.getFromCache<Post>(cacheKey);
            if (cached) return { error: false, result: cached, message: 'Post fetched successfully (from cache)' };
            const result = await this.postRepository.findOne({ where: { postId: id }, relations: ['tag', 'expert'] });
            if (result) await this.setToCache(cacheKey, result);
            if (!result) return { error: true, data: null, message: 'Post not found' };
            return {
                error: false,
                data: result,
                message: 'Post fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch post',
            };
        }
    }

    async update(id: number, updatePostDto: UpdatePostDto, user: any, sourceBuffer?: Buffer) {
        try {
            const post = await this.postRepository.findOne({ where: { postId: id } });
            if (!post) return { error: true, data: null, message: 'Post not found' };
            if (post.expertId !== user.userId) return { error: true, data: null, message: 'You can only update your own posts' };
            let sourceUrl = updatePostDto.sourceUrl;
            if (sourceBuffer) {
                sourceUrl = await this.cloudinaryService.uploadImageFromBuffer(sourceBuffer, 'posts');
            }
            await this.postRepository.update(id, { ...updatePostDto, sourceUrl });
            await this.removeFromCache('posts:all');
            await this.removeFromCache(`posts:${id}`);
            const data = await this.postRepository.findOne({ where: { postId: id } });
            return {
                error: false,
                data,
                message: 'Post updated successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to update post',
            };
        }
    }

    async remove(id: number, user: any) {
        try {
            const post = await this.postRepository.findOne({ where: { postId: id } });
            if (!post) return { error: true, data: null, message: 'Post not found' };
            if (post.expertId !== user.userId) return { error: true, data: null, message: 'You can only delete your own posts' };

            // Soft delete: update status to 'deleted'
            await this.postRepository.update(id, { status: 'deleted' });
            const updatedPost = await this.postRepository.findOne({ where: { postId: id } });

            await this.removeFromCache('posts:all');
            await this.removeFromCache(`posts:${id}`);
            return {
                error: false,
                data: updatedPost,
                message: 'Post deleted successfully (soft delete)',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to delete post',
            };
        }
    }

    async restore(id: number, user: any) {
        try {
            const post = await this.postRepository.findOne({ where: { postId: id } });
            if (!post) return { error: true, data: null, message: 'Post not found' };
            if (post.expertId !== user.userId) return { error: true, data: null, message: 'You can only restore your own posts' };

            // Restore post: update status to 'active'
            await this.postRepository.update(id, { status: 'active' });
            const restoredPost = await this.postRepository.findOne({ where: { postId: id } });

            await this.removeFromCache('posts:all');
            await this.removeFromCache(`posts:${id}`);
            return {
                error: false,
                data: restoredPost,
                message: 'Post restored successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to restore post',
            };
        }
    }
}
