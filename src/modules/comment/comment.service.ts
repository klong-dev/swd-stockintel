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

    async create(createCommentDto: CreateCommentDto, user: any) {
        try {
            const commentData = {
                ...createCommentDto,
                userId: user.userId,
            };
            const comment = this.commentRepository.create(commentData);
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

    async replyToComment(parentCommentId: number, content: string, user: any) {
        try {
            // Check if parent comment exists
            const parentComment = await this.commentRepository.findOne({
                where: { commentId: parentCommentId },
                relations: ['post']
            });

            if (!parentComment) {
                return {
                    error: true,
                    data: null,
                    message: 'Parent comment not found',
                };
            }

            const replyData = {
                content,
                userId: user.userId,
                postId: parentComment.postId,
                parentCommentId: parentCommentId,
            };

            const reply = this.commentRepository.create(replyData);
            const saved = await this.commentRepository.save(reply);

            // Clear relevant cache
            await this.removeFromCache(`${this.cachePrefix}:all`);
            await this.removeFromCache(`${this.cachePrefix}:${saved.commentId}`);
            await this.removeFromCache(`${this.cachePrefix}:replies:${parentCommentId}`);

            return {
                error: false,
                data: saved,
                message: 'Reply created successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to create reply',
            };
        }
    }

    async getReplies(parentCommentId: number, page: number = 1, pageSize: number = 10) {
        try {
            const cacheKey = `${this.cachePrefix}:replies:${parentCommentId}`;
            const cached = await this.getFromCache<any>(cacheKey);
            if (cached) return { error: false, data: cached, message: 'Replies fetched from cache' };

            const replies = await this.commentRepository.find({
                where: { parentCommentId },
                relations: ['user'],
                order: { createdAt: 'ASC' }
            });

            // Remove sensitive user data
            const sanitized = replies.map(reply => {
                if (reply.user) {
                    const { passwordHash, refreshToken, ...userWithoutPassword } = reply.user;
                    return { ...reply, user: userWithoutPassword };
                }
                return reply;
            });

            const paginated = paginate(sanitized, page, pageSize);

            if (paginated) await this.setToCache(cacheKey, paginated);

            return {
                error: false,
                data: paginated,
                message: 'Replies fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch replies',
            };
        }
    }

    async findAll(page: number = 1, pageSize: number = 10, includeReplies: boolean = false): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const relations = ['user', 'post'];
            if (includeReplies) {
                relations.push('children', 'children.user');
            }

            const data = await this.commentRepository.find({
                where: { parentCommentId: null }, // Only get top-level comments
                relations,
                order: { createdAt: 'DESC' }
            });

            const sanitized = data.map(comment => {
                // Remove sensitive user data from main comment
                if (comment.user) {
                    const { passwordHash, refreshToken, ...userWithoutPassword } = comment.user;
                    comment.user = userWithoutPassword as any;
                }

                // Remove sensitive user data from replies if included
                if (includeReplies && comment.children) {
                    comment.children = comment.children.map(reply => {
                        if (reply.user) {
                            const { passwordHash, refreshToken, ...userWithoutPassword } = reply.user;
                            reply.user = userWithoutPassword as any;
                        }
                        return reply;
                    });
                }

                return comment;
            });

            const paginated = paginate(sanitized, page, pageSize);
            return {
                error: false,
                data: paginated,
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

    async findOne(id: number, includeReplies: boolean = false) {
        try {
            const cacheKey = `${this.cachePrefix}:${id}:${includeReplies ? 'with-replies' : 'no-replies'}`;
            const cached = await this.getFromCache<Comment>(cacheKey);
            if (cached) return { error: false, data: cached, message: 'Comment fetched from cache' };

            const relations = ['user', 'post'];
            if (includeReplies) {
                relations.push('children', 'children.user');
            }

            const result = await this.commentRepository.findOne({
                where: { commentId: id },
                relations
            });

            if (!result) {
                return {
                    error: true,
                    data: null,
                    message: 'Comment not found',
                };
            }

            // Remove sensitive user data from main comment
            if (result.user) {
                const { passwordHash, refreshToken, ...userWithoutPassword } = result.user;
                result.user = userWithoutPassword as any;
            }

            // Remove sensitive user data from replies if included
            if (includeReplies && result.children) {
                result.children = result.children.map(reply => {
                    if (reply.user) {
                        const { passwordHash, refreshToken, ...userWithoutPassword } = reply.user;
                        reply.user = userWithoutPassword as any;
                    }
                    return reply;
                });
            }

            if (result) await this.setToCache(cacheKey, result);
            return {
                error: false,
                data: result,
                message: 'Comment fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch comment',
            };
        }
    }

    async update(id: number, updateCommentDto: UpdateCommentDto, user: any) {
        try {
            const comment = await this.commentRepository.findOne({ where: { commentId: id } });

            if (!comment) {
                return {
                    error: true,
                    data: null,
                    message: 'Comment not found',
                };
            }

            // Check if user owns the comment
            if (comment.userId !== user.userId) {
                return {
                    error: true,
                    data: null,
                    message: 'You can only update your own comments',
                };
            }

            await this.commentRepository.update(id, {
                ...updateCommentDto,
                isEdited: true,
                updatedAt: new Date()
            });
            await this.removeFromCache(`${this.cachePrefix}:all`);
            await this.removeFromCache(`${this.cachePrefix}:${id}`);
            const updated = await this.commentRepository.findOne({
                where: { commentId: id },
                relations: ['user', 'post']
            });
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

    async remove(id: number, user: any) {
        try {
            const comment = await this.commentRepository.findOne({ where: { commentId: id } });

            if (!comment) {
                return {
                    error: true,
                    data: null,
                    message: 'Comment not found',
                };
            }

            // Check if user owns the comment
            if (comment.userId !== user.userId) {
                return {
                    error: true,
                    data: null,
                    message: 'You can only delete your own comments',
                };
            }

            const result = await this.commentRepository.delete(id);

            // Clear all related cache
            await this.removeFromCache(`${this.cachePrefix}:all`);
            await this.removeFromCache(`${this.cachePrefix}:${id}`);
            await this.removeFromCache(`${this.cachePrefix}:${id}:with-replies`);
            await this.removeFromCache(`${this.cachePrefix}:${id}:no-replies`);

            // If this comment has a parent, clear the parent's replies cache
            if (comment.parentCommentId) {
                await this.removeFromCache(`${this.cachePrefix}:replies:${comment.parentCommentId}`);
            }

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
