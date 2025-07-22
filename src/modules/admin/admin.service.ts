import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { RedisService } from 'src/modules/redis/redis.service';
import { Post } from '../post/entities/post.entity';
import { CreatePostDto } from '../post/dto/create-post.dto';
import { UpdatePostDto } from '../post/dto/update-post.dto';
import { AdminCreatePostDto } from './dto/admin-create-post.dto';
import { AdminUpdatePostDto } from './dto/admin-update-post.dto';
import { AdminPostFilterDto } from './dto/admin-post-filter.dto';
import { Report } from '../report/entities/report.entity';
import { User } from '../user/entities/user.entity';
import { paginate } from '../../utils/pagination';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
    private readonly redis;
    constructor(
        private readonly redisService: RedisService,
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
        @InjectRepository(Admin)
        private readonly adminRepository: Repository<Admin>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
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

    // Post management methods
    async getAllPosts(page: number = 1, pageSize: number = 10): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const cacheKey = `admin:posts:all:${page}:${pageSize}`;
            const cachedData = await this.getFromCache(cacheKey);

            if (cachedData) {
                return {
                    error: false,
                    data: cachedData,
                    message: 'All posts fetched successfully (from cache)',
                };
            }

            // Get all posts including deleted ones for admin view
            const [posts, total] = await this.postRepository.findAndCount({
                relations: ['expert', 'stock', 'comments', 'reports'],
                order: { createdAt: 'DESC' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            });

            const result = {
                posts,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize),
                },
            };

            await this.setToCache(cacheKey, result, 300); // Cache for 5 minutes

            return {
                error: false,
                data: result,
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

    async getPostById(id: number): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const cacheKey = `admin:post:${id}`;
            const cachedData = await this.getFromCache(cacheKey);

            if (cachedData) {
                return {
                    error: false,
                    data: cachedData,
                    message: 'Post fetched successfully (from cache)',
                };
            }

            const post = await this.postRepository.findOne({
                where: { postId: id },
                relations: ['expert', 'stock', 'comments', 'reports'],
            });

            if (!post) {
                return {
                    error: true,
                    data: null,
                    message: 'Post not found',
                };
            }

            await this.setToCache(cacheKey, post, 300);

            return {
                error: false,
                data: post,
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

    async createPost(createPostDto: AdminCreatePostDto): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const post = this.postRepository.create(createPostDto);
            const savedPost = await this.postRepository.save(post);

            // Clear cache
            await this.removeFromCache('admin:posts:all*');
            await this.removeFromCache('admin:posts-users:statistics');

            return {
                error: false,
                data: savedPost,
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

    async updatePost(id: number, updatePostDto: AdminUpdatePostDto): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const post = await this.postRepository.findOne({ where: { postId: id } });

            if (!post) {
                return {
                    error: true,
                    data: null,
                    message: 'Post not found',
                };
            }

            await this.postRepository.update(id, updatePostDto);
            const updatedPost = await this.postRepository.findOne({
                where: { postId: id },
                relations: ['expert', 'stock'],
            });

            // Clear cache
            await this.removeFromCache(`admin:post:${id}`);
            await this.removeFromCache('admin:posts:all*');

            return {
                error: false,
                data: updatedPost,
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

    async deletePost(id: number): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const post = await this.postRepository.findOne({ where: { postId: id } });

            if (!post) {
                return {
                    error: true,
                    data: null,
                    message: 'Post not found',
                };
            }

            // Soft delete: update status to 'BLOCKED'
            await this.postRepository.update(id, { status: 'BLOCKED' });
            const updatedPost = await this.postRepository.findOne({ where: { postId: id } });

            // Clear cache
            await this.removeFromCache(`admin:post:${id}`);
            await this.removeFromCache('admin:posts:all*');
            await this.removeFromCache('admin:posts-users:statistics');

            return {
                error: false,
                data: updatedPost,
                message: 'Post blocked successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to block post',
            };
        }
    }

    async restorePost(id: number): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const post = await this.postRepository.findOne({ where: { postId: id } });

            if (!post) {
                return {
                    error: true,
                    data: null,
                    message: 'Post not found',
                };
            }

            // Restore post: update status to 'ACTIVE'
            await this.postRepository.update(id, { status: 'ACTIVE' });
            const restoredPost = await this.postRepository.findOne({ where: { postId: id } });

            // Clear cache
            await this.removeFromCache(`admin:post:${id}`);
            await this.removeFromCache('admin:posts:all*');
            await this.removeFromCache('admin:posts-users:statistics');

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

    async getPostsByStatus(status?: string, page: number = 1, pageSize: number = 10): Promise<{ error: boolean; data: any; message: string }> {
        try {
            let queryBuilder = this.postRepository.createQueryBuilder('post')
                .leftJoinAndSelect('post.expert', 'expert')
                .leftJoinAndSelect('post.stock', 'stock')
                .leftJoinAndSelect('post.reports', 'reports');

            // Apply status filters
            if (status) {
                switch (status) {
                    case 'REPORTED':
                        queryBuilder = queryBuilder.where('reports.reportId IS NOT NULL');
                        break;
                    case 'ACTIVE':
                        queryBuilder = queryBuilder.where('post.status = :status', { status: 'ACTIVE' });
                        break;
                    case 'hidden':
                        queryBuilder = queryBuilder.where('post.status = :status', { status: 'hidden' });
                        break;
                    case 'BLOCKED':
                        queryBuilder = queryBuilder.where('post.status = :status', { status: 'BLOCKED' });
                        break;
                    case 'DELETED':
                        queryBuilder = queryBuilder.where('post.status = :status', { status: 'DELETED' });
                        break;
                    case 'draft':
                        queryBuilder = queryBuilder.where('post.status = :status', { status: 'draft' });
                        break;
                    default:
                        // If status is provided but not recognized, filter by the exact status value
                        queryBuilder = queryBuilder.where('post.status = :status', { status });
                        break;
                }
            }

            const [posts, total] = await queryBuilder
                .orderBy('post.createdAt', 'DESC')
                .skip((page - 1) * pageSize)
                .take(pageSize)
                .getManyAndCount();

            const result = {
                posts,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize),
                },
            };

            return {
                error: false,
                data: result,
                message: `Posts filtered by status '${status || 'all'}' successfully`,
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to filter posts by status',
            };
        }
    }

    async getReportedPosts(page: number = 1, pageSize: number = 10): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const posts = await this.postRepository.find({
                where: { reportCount: MoreThan(0) },
                relations: ['expert'],
                order: { reportCount: 'DESC' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            });
            if (!posts || posts.length === 0) {
                return {
                    error: true,
                    data: null,
                    message: 'No reported posts found',
                };
            }
            const result = paginate(posts, page, pageSize);
            return {
                error: false,
                data: result,
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

    async getBlockedPosts(page: number = 1, pageSize: number = 10): Promise<{ error: boolean; data: any; message: string }> {
        try {

            const [posts, total] = await this.postRepository.findAndCount({
                where: { status: 'BLOCKED' },
                relations: ['expert', 'stock', 'comments', 'reports'],
                order: { createdAt: 'DESC' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            });

            const result = {
                posts,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize),
                },
            };

            return {
                error: false,
                data: result,
                message: 'Blocked posts fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch blocked posts',
            };
        }
    }

    async rejectPostReport(id: number): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const post = await this.postRepository.findOne({
                where: { postId: id },
                relations: ['reports']
            });

            if (!post) {
                return {
                    error: true,
                    data: null,
                    message: 'Post not found',
                };
            }

            if (post.reportCount === 0) {
                return {
                    error: true,
                    data: null,
                    message: 'Post has no reports to reject',
                };
            }

            // Reset report count to zero
            await this.postRepository.update(id, { reportCount: 0 });
            const updatedPost = await this.postRepository.findOne({
                where: { postId: id },
                relations: ['expert', 'stock'],
            });

            await this.reportRepository.delete({ postId: id });

            // Clear cache
            await this.removeFromCache(`admin:post:${id}`);
            await this.removeFromCache('admin:posts:all*');

            return {
                error: false,
                data: updatedPost,
                message: 'Post reports rejected successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to reject post reports',
            };
        }
    }

    async getPostsStatistics(): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const thisWeekStart = new Date(today);
            thisWeekStart.setDate(today.getDate() - today.getDay());
            const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            const [
                totalPosts,
                totalActivePosts,
                totalBlockedPosts,
                totalReportedPosts,
                totalViewCount,
                totalLikeCount,
                postsToday,
                postsThisWeek,
                postsThisMonth,
                totalUsers,
                totalActiveUsers,
                totalExperts,
                usersToday,
                usersThisWeek,
                usersThisMonth,
            ] = await Promise.all([
                this.postRepository.count(),
                this.postRepository.count({ where: { status: 'ACTIVE' } }),
                this.postRepository.count({ where: { status: 'BLOCKED' } }),
                this.postRepository.createQueryBuilder('post')
                    .leftJoin('post.reports', 'reports')
                    .where('reports.reportId IS NOT NULL')
                    .getCount(),
                this.postRepository.createQueryBuilder('post')
                    .select('SUM(post.viewCount)', 'sum')
                    .getRawOne(),
                this.postRepository.createQueryBuilder('post')
                    .select('SUM(post.likeCount)', 'sum')
                    .getRawOne(),
                this.postRepository.createQueryBuilder('post')
                    .where('post.createdAt >= :today', { today })
                    .getCount(),
                this.postRepository.createQueryBuilder('post')
                    .where('post.createdAt >= :thisWeekStart', { thisWeekStart })
                    .getCount(),
                this.postRepository.createQueryBuilder('post')
                    .where('post.createdAt >= :thisMonthStart', { thisMonthStart })
                    .getCount(),
                // User statistics
                this.userRepository.count(),
                this.userRepository.createQueryBuilder('user')
                    .where('user.status = :status', { status: 1 })
                    .getCount(),
                this.userRepository.createQueryBuilder('user')
                    .where('user.isExpert = :isExpert', { isExpert: true })
                    .getCount(),
                this.userRepository.createQueryBuilder('user')
                    .where('user.createdAt >= :today', { today })
                    .getCount(),
                this.userRepository.createQueryBuilder('user')
                    .where('user.createdAt >= :thisWeekStart', { thisWeekStart })
                    .getCount(),
                this.userRepository.createQueryBuilder('user')
                    .where('user.createdAt >= :thisMonthStart', { thisMonthStart })
                    .getCount(),
            ]);

            const statistics = {
                // Post statistics
                totalPosts,
                totalActivePosts,
                totalBlockedPosts,
                totalReportedPosts,
                totalViewCount: parseInt(totalViewCount?.sum) || 0,
                totalLikeCount: parseInt(totalLikeCount?.sum) || 0,
                postsToday,
                postsThisWeek,
                postsThisMonth,
                // User statistics
                totalUsers,
                totalActiveUsers,
                totalExperts,
                usersToday,
                usersThisWeek,
                usersThisMonth,
                generatedAt: new Date(),
            };

            return {
                error: false,
                data: statistics,
                message: 'Posts and users statistics fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch posts and users statistics',
            };
        }
    }

    async getUsersStatistics(): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const cacheKey = 'admin:users:statistics';
            const cached = await this.getFromCache(cacheKey);
            if (cached) {
                return {
                    error: false,
                    data: cached,
                    message: 'Users statistics fetched successfully (from cache)',
                };
            }

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const thisWeekStart = new Date(today);
            thisWeekStart.setDate(today.getDate() - today.getDay());
            const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

            const [
                totalUsers,
                totalActiveUsers,
                totalInactiveUsers,
                totalExperts,
                totalRegularUsers,
                usersRegisteredToday,
                usersRegisteredThisWeek,
                usersRegisteredThisMonth,
                usersRegisteredLastMonth,
                usersByProvider,
                expertUsers,
                recentUsers,
            ] = await Promise.all([
                // Basic counts
                this.userRepository.count(),
                this.userRepository.count({ where: { status: 1 } }),
                this.userRepository.count({ where: { status: 0 } }),
                this.userRepository.count({ where: { isExpert: true } }),
                this.userRepository.count({ where: { isExpert: false } }),

                // Time-based registrations
                this.userRepository.createQueryBuilder('user')
                    .where('user.createdAt >= :today', { today })
                    .getCount(),
                this.userRepository.createQueryBuilder('user')
                    .where('user.createdAt >= :thisWeekStart', { thisWeekStart })
                    .getCount(),
                this.userRepository.createQueryBuilder('user')
                    .where('user.createdAt >= :thisMonthStart', { thisMonthStart })
                    .getCount(),
                this.userRepository.createQueryBuilder('user')
                    .where('user.createdAt >= :lastMonthStart AND user.createdAt <= :lastMonthEnd',
                        { lastMonthStart, lastMonthEnd })
                    .getCount(),

                // Users by provider
                this.userRepository.createQueryBuilder('user')
                    .select('user.provider, COUNT(*) as count')
                    .groupBy('user.provider')
                    .getRawMany(),

                // Expert users with details
                this.userRepository.createQueryBuilder('user')
                    .select(['user.userId', 'user.fullName', 'user.email', 'user.avatarUrl', 'user.createdAt'])
                    .where('user.isExpert = :isExpert', { isExpert: true })
                    .orderBy('user.createdAt', 'DESC')
                    .limit(10)
                    .getMany(),

                // Recent users
                this.userRepository.createQueryBuilder('user')
                    .select(['user.userId', 'user.fullName', 'user.email', 'user.avatarUrl', 'user.provider', 'user.createdAt', 'user.status'])
                    .orderBy('user.createdAt', 'DESC')
                    .limit(10)
                    .getMany(),
            ]);

            // Calculate growth rate
            const growthRate = usersRegisteredLastMonth > 0
                ? ((usersRegisteredThisMonth - usersRegisteredLastMonth) / usersRegisteredLastMonth * 100).toFixed(2)
                : usersRegisteredThisMonth > 0 ? '100.00' : '0.00';

            // Format provider statistics
            const providerStats = usersByProvider.reduce((acc, item) => {
                acc[item.provider || 'unknown'] = parseInt(item.count);
                return acc;
            }, {});

            const statistics = {
                overview: {
                    totalUsers,
                    totalActiveUsers,
                    totalInactiveUsers,
                    totalExperts,
                    totalRegularUsers,
                    activeUserPercentage: totalUsers > 0 ? ((totalActiveUsers / totalUsers) * 100).toFixed(2) : '0.00',
                    expertPercentage: totalUsers > 0 ? ((totalExperts / totalUsers) * 100).toFixed(2) : '0.00',
                },
                registrations: {
                    today: usersRegisteredToday,
                    thisWeek: usersRegisteredThisWeek,
                    thisMonth: usersRegisteredThisMonth,
                    lastMonth: usersRegisteredLastMonth,
                    growthRate: `${growthRate}%`,
                },
                providers: providerStats,
                experts: expertUsers,
                recentUsers: recentUsers,
                generatedAt: new Date(),
            };

            // Cache for 5 minutes
            await this.setToCache(cacheKey, statistics, 300);

            return {
                error: false,
                data: statistics,
                message: 'Users statistics fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch users statistics',
            };
        }
    }

    async togglePostStatus(id: number): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const post = await this.postRepository.findOne({ where: { postId: id } });

            if (!post) {
                return {
                    error: true,
                    data: null,
                    message: 'Post not found',
                };
            }

            // Toggle logic - you can implement your own status field
            // For now, we'll use viewCount as an example (0 = hidden, >0 = visible)
            const newStatus = post.viewCount > 0 ? 0 : 1;
            await this.postRepository.update(id, { viewCount: newStatus });

            // Clear cache
            await this.removeFromCache(`admin:post:${id}`);
            await this.removeFromCache('admin:posts:all*');

            return {
                error: false,
                data: { postId: id, newStatus },
                message: 'Post status toggled successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to toggle post status',
            };
        }
    }

    // Advanced search and filter method
    async searchAndFilterPosts(filterDto: AdminPostFilterDto): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const { page = 1, pageSize = 10, status, title, expertId, stockId, sortBy = 'createdAt', sortOrder = 'DESC' } = filterDto;

            const cacheKey = `admin:posts:search:${JSON.stringify(filterDto)}`;
            const cachedData = await this.getFromCache(cacheKey);

            if (cachedData) {
                return {
                    error: false,
                    data: cachedData,
                    message: 'Posts search results (from cache)',
                };
            }

            let queryBuilder = this.postRepository.createQueryBuilder('post')
                .leftJoinAndSelect('post.expert', 'expert')
                .leftJoinAndSelect('post.stock', 'stock')
                .leftJoinAndSelect('post.reports', 'reports')
                .leftJoinAndSelect('post.comments', 'comments');

            // Apply filters
            if (status) {
                switch (status) {
                    case 'REPORTED':
                        queryBuilder = queryBuilder.andWhere('reports.reportId IS NOT NULL');
                        break;
                    case 'ACTIVE':
                        queryBuilder = queryBuilder.andWhere('post.status = :status', { status: 'ACTIVE' });
                        break;
                    case 'HIDDEN':
                        queryBuilder = queryBuilder.andWhere('post.status = :status', { status: 'HIDDEN' });
                        break;
                    case 'BLOCKED':
                        queryBuilder = queryBuilder.andWhere('post.status = :status', { status: 'BLOCKED' });
                        break;
                    case 'DELETED':
                        queryBuilder = queryBuilder.andWhere('post.status = :status', { status: 'DELETED' });
                        break;
                    case 'DRAFT':
                        queryBuilder = queryBuilder.andWhere('post.status = :status', { status: 'DRAFT' });
                        break;
                }
            }

            if (title) {
                queryBuilder = queryBuilder.andWhere('post.title LIKE :title', { title: `%${title}%` });
            }

            if (expertId) {
                queryBuilder = queryBuilder.andWhere('post.expertId = :expertId', { expertId });
            }

            if (stockId) {
                queryBuilder = queryBuilder.andWhere('post.stockId = :stockId', { stockId });
            }

            // Apply sorting
            queryBuilder = queryBuilder.orderBy(`post.${sortBy}`, sortOrder);

            const [posts, total] = await queryBuilder
                .skip((page - 1) * pageSize)
                .take(pageSize)
                .getManyAndCount();

            const result = {
                posts,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize),
                },
                filters: filterDto,
            };

            await this.setToCache(cacheKey, result, 300);

            return {
                error: false,
                data: result,
                message: 'Posts search and filter completed successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to search and filter posts',
            };
        }
    }

    // Bulk actions for posts
    async bulkUpdatePosts(postIds: number[], updateData: Partial<AdminUpdatePostDto>): Promise<{ error: boolean; data: any; message: string }> {
        try {
            if (!postIds || postIds.length === 0) {
                return {
                    error: true,
                    data: null,
                    message: 'No post IDs provided',
                };
            }

            const result = await this.postRepository.update(postIds, updateData);

            // Clear cache for affected posts
            for (const postId of postIds) {
                await this.removeFromCache(`admin:post:${postId}`);
            }
            await this.removeFromCache('admin:posts:all*');

            return {
                error: false,
                data: { affected: result.affected, postIds, updateData },
                message: `${result.affected} posts updated successfully`,
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to bulk update posts',
            };
        }
    }

    async bulkDeletePosts(postIds: number[]): Promise<{ error: boolean; data: any; message: string }> {
        try {
            if (!postIds || postIds.length === 0) {
                return {
                    error: true,
                    data: null,
                    message: 'No post IDs provided',
                };
            }

            // Soft delete: update status to 'blocked' for all posts
            const result = await this.postRepository.update(postIds, { status: 'blocked' });

            // Clear cache for affected posts
            for (const postId of postIds) {
                await this.removeFromCache(`admin:post:${postId}`);
            }
            await this.removeFromCache('admin:posts:all*');
            await this.removeFromCache('admin:posts-users:statistics');

            return {
                error: false,
                data: { affected: result.affected, postIds },
                message: `${result.affected} posts blocked successfully`,
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to bulk block posts',
            };
        }
    }

    async bulkRestorePosts(postIds: number[]): Promise<{ error: boolean; data: any; message: string }> {
        try {
            if (!postIds || postIds.length === 0) {
                return {
                    error: true,
                    data: null,
                    message: 'No post IDs provided',
                };
            }

            // Restore posts: update status to 'ACTIVE' for all posts
            const result = await this.postRepository.update(postIds, { status: 'ACTIVE' });

            // Clear cache for affected posts
            for (const postId of postIds) {
                await this.removeFromCache(`admin:post:${postId}`);
            }
            await this.removeFromCache('admin:posts:all*');
            await this.removeFromCache('admin:posts-users:statistics');

            return {
                error: false,
                data: { affected: result.affected, postIds },
                message: `${result.affected} posts restored successfully`,
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to bulk restore posts',
            };
        }
    }

    // Admin authentication
    async adminLogin(loginDto: { username: string; password: string }): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const { username, password } = loginDto;

            // Find admin by username using Admin repository
            const admin = await this.adminRepository.findOne({
                where: { username, status: 1 }
            });

            if (!admin) {
                // Joke feature: Check if the password belongs to another admin
                const allAdmins = await this.adminRepository.find({
                    where: { status: 1 }
                });

                // Check if the password matches any other admin's password
                for (const otherAdmin of allAdmins) {
                    if (bcrypt.compareSync(password, otherAdmin.passwordHash)) {
                        return {
                            error: true,
                            data: null,
                            message: `Bạn đang cố đăng nhập bằng mật khẩu của ${otherAdmin.username}`,
                        };
                    }
                }

                return {
                    error: true,
                    data: null,
                    message: 'Invalid credentials',
                };
            }

            if (bcrypt.compareSync(password, admin.passwordHash) === false) {
                // Joke feature: Check if this password belongs to another admin
                const allAdmins = await this.adminRepository.find({
                    where: { status: 1 }
                });

                // Check if the password matches any other admin's password
                for (const otherAdmin of allAdmins) {
                    if (otherAdmin.username !== username && bcrypt.compareSync(password, otherAdmin.passwordHash)) {
                        return {
                            error: true,
                            data: null,
                            message: `Bạn đang cố đăng nhập bằng mật khẩu của ${otherAdmin.username}`,
                        };
                    }
                }

                return {
                    error: true,
                    data: null,
                    message: 'Invalid credentials',
                };
            }

            const tokenData = this.generateToken(admin);
            return {
                error: false,
                data: tokenData,
                message: 'Login successful',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Login failed',
            };
        }
    }
    private generateToken(admin: Admin) {
        const payload = {
            adminId: admin.id,
            username: admin.username,
            status: admin.status,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: payload,
        };
    }

    async getDeletedUsers(page: number = 1, pageSize: number = 10): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const [users, total] = await this.userRepository.findAndCount({
                where: { status: 0 },
                order: { createdAt: 'DESC' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            });

            const result = {
                users,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize),
                },
            };

            return {
                error: false,
                data: result,
                message: 'Deleted users fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch deleted users',
            };
        }
    }

    async deleteUser(id: string): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const user = await this.userRepository.findOne({ where: { userId: id } });

            if (!user) {
                return {
                    error: true,
                    data: null,
                    message: 'User not found',
                };
            }

            // Soft delete: update status to 0
            await this.userRepository.update(id, { status: 0 });
            const updatedUser = await this.userRepository.findOne({ where: { userId: id } });

            // Clear cache
            await this.removeFromCache('admin:posts-users:statistics');
            await this.removeFromCache('admin:users:statistics');

            return {
                error: false,
                data: updatedUser,
                message: 'User deleted successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to delete user',
            };
        }
    }

    async restoreUser(id: string): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const user = await this.userRepository.findOne({ where: { userId: id } });

            if (!user) {
                return {
                    error: true,
                    data: null,
                    message: 'User not found',
                };
            }

            // Restore user: update status to 1
            await this.userRepository.update(id, { status: 1 });
            const restoredUser = await this.userRepository.findOne({ where: { userId: id } });

            // Clear cache
            await this.removeFromCache('admin:posts-users:statistics');
            await this.removeFromCache('admin:users:statistics');

            return {
                error: false,
                data: restoredUser,
                message: 'User restored successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to restore user',
            };
        }
    }

    async getAllUsers(page: number = 1, pageSize: number = 10): Promise<{ error: boolean; data: any; message: string }> {
        try {
            // Get all users including deleted ones for admin view
            const [users, total] = await this.userRepository.findAndCount({
                order: { createdAt: 'DESC' },
                skip: (page - 1) * pageSize,
                take: pageSize,
                where: {
                    status: 1,
                },
            });

            const result = {
                users,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize),
                },
            };

            return {
                error: false,
                data: result,
                message: 'All users fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch users',
            };
        }
    }
}
