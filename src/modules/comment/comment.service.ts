import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../post/entities/post.entity';
import { User } from '../user/entities/user.entity';
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
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
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

    async create(createCommentDto: CreateCommentDto, user: any) {
        try {
            // Explicitly extract only the fields we want from the DTO
            const { content, postId, parentCommentId, isEdited, likeCount } = createCommentDto;

            // Validate foreign key references before creating
            if (postId) {
                // Check if post exists
                const postExists = await this.postRepository.findOne({
                    where: { postId }
                });

                if (!postExists) {
                    return {
                        error: true,
                        data: null,
                        message: 'Post not found',
                    };
                }
            }

            if (parentCommentId) {
                // Check if parent comment exists
                const parentExists = await this.commentRepository.findOne({
                    where: { commentId: parentCommentId }
                });

                if (!parentExists) {
                    return {
                        error: true,
                        data: null,
                        message: 'Parent comment not found',
                    };
                }
            }

            // Check if user exists
            const userExists = await this.userRepository.findOne({
                where: { userId: user.userId }
            });

            if (!userExists) {
                return {
                    error: true,
                    data: null,
                    message: 'User not found',
                };
            }

            const commentData = {
                content,
                postId: postId || null,
                parentCommentId: parentCommentId || null,
                isEdited: isEdited || false,
                likeCount: likeCount || 0,
                userId: user.userId,
            };

            // Log the data being saved for debugging
            console.log('Creating comment with data:', commentData);

            // Use transaction to ensure data consistency
            const savedComment = await this.commentRepository.manager.transaction(async manager => {
                const comment = manager.create(Comment, commentData);
                const saved = await manager.save(comment);
                return Array.isArray(saved) ? saved[0] : saved;
            });

            await this.removeFromCache(`${this.cachePrefix}:all`);
            await this.removeFromCache(`${this.cachePrefix}:${savedComment.commentId}`);

            // Clear post-specific comment cache - scan and clear all related keys
            if (savedComment.postId) {
                await this.clearCachePattern(`${this.cachePrefix}:post:${savedComment.postId}:*`);
            }
            return {
                error: false,
                data: savedComment,
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

            // Ensure saved is a single entity, not an array
            const savedReply = Array.isArray(saved) ? saved[0] : saved;

            // Clear relevant cache
            await this.removeFromCache(`${this.cachePrefix}:all`);
            await this.removeFromCache(`${this.cachePrefix}:${savedReply.commentId}`);
            await this.removeFromCache(`${this.cachePrefix}:replies:${parentCommentId}`);
            // Clear post-specific comment cache since replies are included - scan and clear all related keys
            if (savedReply.postId) {
                await this.clearCachePattern(`${this.cachePrefix}:post:${savedReply.postId}:*`);
            }

            return {
                error: false,
                data: savedReply,
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

            // Clear all related cache keys
            await this.clearCachePattern(`${this.cachePrefix}:*`);

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

            // Clear all related cache keys
            await this.clearCachePattern(`${this.cachePrefix}:*`);

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

    async getCommentsByPostId(postId: number, page: number = 1, pageSize: number = 10, includeReplies: boolean = true) {
        try {
            const cacheKey = `${this.cachePrefix}:post:${postId}:page:${page}:size:${pageSize}:replies:${includeReplies}`;
            const cached = await this.getFromCache(cacheKey);
            if (cached) {
                return {
                    error: false,
                    data: cached,
                    message: 'Comments for post fetched successfully (from cache)',
                };
            }

            // Build query for comments belonging to the post (no parent comment = top-level comments)
            const queryBuilder = this.commentRepository.createQueryBuilder('comment')
                .leftJoinAndSelect('comment.user', 'user')
                .where('comment.postId = :postId', { postId })
                .andWhere('comment.parentCommentId IS NULL') // Only top-level comments
                .orderBy('comment.createdAt', 'DESC');

            // If including replies, also fetch them
            if (includeReplies) {
                queryBuilder.leftJoinAndSelect('comment.children', 'replies')
                    .leftJoinAndSelect('replies.user', 'replyUser')
                    .addOrderBy('replies.createdAt', 'ASC'); // Replies ordered chronologically
            }

            // Get total count for pagination
            const totalQuery = this.commentRepository.createQueryBuilder('comment')
                .where('comment.postId = :postId', { postId })
                .andWhere('comment.parentCommentId IS NULL');

            const total = await totalQuery.getCount();

            // Apply pagination
            const comments = await queryBuilder
                .skip((page - 1) * pageSize)
                .take(pageSize)
                .getMany();

            const totalPages = Math.ceil(total / pageSize);
            const result = {
                data: comments,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages,
                },
            };

            // Cache for 5 minutes
            await this.setToCache(cacheKey, result, 300);

            return {
                error: false,
                data: result,
                message: 'Comments for post fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch comments for post',
            };
        }
    }
}
