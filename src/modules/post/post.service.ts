import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { VotePostDto } from './dto/vote-post.dto';
import { UserFavorite } from '../user/entities/user-favorite.entity';
import { UserVote } from '../user/entities/user-vote.entity';
import { RedisService } from 'src/modules/redis/redis.service';
import { paginate } from '../../utils/pagination';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class PostService {
    private readonly redis;
    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        @InjectRepository(UserFavorite)
        private readonly userFavoriteRepository: Repository<UserFavorite>,
        @InjectRepository(UserVote)
        private readonly userVoteRepository: Repository<UserVote>,
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
                where: { status: 'ACTIVE' },
                relations: ['expert']
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
                where: { status: 'DELETED' },
                relations: ['expert']
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
                where: { status: 'ACTIVE' },
                order: { viewCount: 'DESC' },
                take: size,
                relations: ['expert']
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
            const result = await this.postRepository.findOne({ where: { postId: id }, relations: ['expert'] });
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

            // Soft delete: update status to 'DELETED'
            await this.postRepository.update(id, { status: 'DELETED' });
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
            await this.postRepository.update(id, { status: 'ACTIVE' });
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

    async favoritePost(postId: number, user: any) {
        try {
            // Check if post exists
            const post = await this.postRepository.findOne({ where: { postId } });
            if (!post) {
                return {
                    error: true,
                    data: null,
                    message: 'Post not found',
                };
            }

            // Check if already favorited
            const existingFavorite = await this.userFavoriteRepository.findOne({
                where: { userId: user.userId, postId }
            });

            if (existingFavorite) {
                return {
                    error: true,
                    data: null,
                    message: 'Post already favorited',
                };
            }

            // Create favorite
            const favorite = this.userFavoriteRepository.create({
                userId: user.userId,
                postId
            });
            await this.userFavoriteRepository.save(favorite);

            // Update favorite count
            await this.postRepository.increment({ postId }, 'favoriteCount', 1);

            // Clear cache
            await this.removeFromCache('posts:all');
            await this.removeFromCache(`posts:${postId}`);
            await this.removeFromCache(`user:${user.userId}:favorites`);

            return {
                error: false,
                data: { favorited: true },
                message: 'Post favorited successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to favorite post',
            };
        }
    }

    async unfavoritePost(postId: number, user: any) {
        try {
            // Check if post exists
            const post = await this.postRepository.findOne({ where: { postId } });
            if (!post) {
                return {
                    error: true,
                    data: null,
                    message: 'Post not found',
                };
            }

            // Check if favorited
            const existingFavorite = await this.userFavoriteRepository.findOne({
                where: { userId: user.userId, postId }
            });

            if (!existingFavorite) {
                return {
                    error: true,
                    data: null,
                    message: 'Post not favorited',
                };
            }

            // Remove favorite
            await this.userFavoriteRepository.remove(existingFavorite);

            // Update favorite count
            await this.postRepository.decrement({ postId }, 'favoriteCount', 1);

            // Clear cache
            await this.removeFromCache('posts:all');
            await this.removeFromCache(`posts:${postId}`);
            await this.removeFromCache(`user:${user.userId}:favorites`);

            return {
                error: false,
                data: { favorited: false },
                message: 'Post unfavorited successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to unfavorite post',
            };
        }
    }

    async votePost(postId: number, votePostDto: VotePostDto, user: any) {
        try {
            // Check if post exists
            const post = await this.postRepository.findOne({ where: { postId } });
            if (!post) {
                return {
                    error: true,
                    data: null,
                    message: 'Post not found',
                };
            }

            // Check existing vote
            const existingVote = await this.userVoteRepository.findOne({
                where: { userId: user.userId, postId }
            });

            if (existingVote) {
                // If same vote type, remove the vote
                if (existingVote.voteType === votePostDto.voteType) {
                    await this.userVoteRepository.remove(existingVote);

                    // Update count
                    if (votePostDto.voteType === 'UPVOTE') {
                        await this.postRepository.decrement({ postId }, 'upvoteCount', 1);
                    } else {
                        await this.postRepository.decrement({ postId }, 'downvoteCount', 1);
                    }

                    await this.removeFromCache('posts:all');
                    await this.removeFromCache(`posts:${postId}`);

                    return {
                        error: false,
                        data: { voteType: null, removed: true },
                        message: 'Vote removed successfully',
                    };
                } else {
                    // Change vote type
                    const oldVoteType = existingVote.voteType;
                    existingVote.voteType = votePostDto.voteType;
                    existingVote.updatedAt = new Date();
                    await this.userVoteRepository.save(existingVote);

                    // Update counts
                    if (oldVoteType === 'UPVOTE') {
                        await this.postRepository.decrement({ postId }, 'upvoteCount', 1);
                        await this.postRepository.increment({ postId }, 'downvoteCount', 1);
                    } else {
                        await this.postRepository.decrement({ postId }, 'downvoteCount', 1);
                        await this.postRepository.increment({ postId }, 'upvoteCount', 1);
                    }

                    await this.removeFromCache('posts:all');
                    await this.removeFromCache(`posts:${postId}`);

                    return {
                        error: false,
                        data: { voteType: votePostDto.voteType, changed: true },
                        message: 'Vote updated successfully',
                    };
                }
            } else {
                // Create new vote
                const vote = this.userVoteRepository.create({
                    userId: user.userId,
                    postId,
                    voteType: votePostDto.voteType
                });
                await this.userVoteRepository.save(vote);

                // Update count
                if (votePostDto.voteType === 'UPVOTE') {
                    await this.postRepository.increment({ postId }, 'upvoteCount', 1);
                } else {
                    await this.postRepository.increment({ postId }, 'downvoteCount', 1);
                }

                await this.removeFromCache('posts:all');
                await this.removeFromCache(`posts:${postId}`);

                return {
                    error: false,
                    data: { voteType: votePostDto.voteType, created: true },
                    message: 'Vote added successfully',
                };
            }
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to vote on post',
            };
        }
    }

    async getUserFavoritePosts(userId: string, page: number = 1, pageSize: number = 10) {
        try {
            const cacheKey = `user:${userId}:favorites`;
            const cached = await this.getFromCache<any>(cacheKey);
            if (cached) return { error: false, data: cached, message: 'Favorite posts fetched from cache' };

            const favorites = await this.userFavoriteRepository.find({
                where: { userId },
                relations: ['post', 'post.expert', 'post.stock'],
                order: { createdAt: 'DESC' }
            });

            const posts = favorites.map(fav => fav.post);
            const paginated = paginate(posts, page, pageSize);

            if (paginated) await this.setToCache(cacheKey, paginated);

            return {
                error: false,
                data: paginated,
                message: 'Favorite posts fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch favorite posts',
            };
        }
    }
}
