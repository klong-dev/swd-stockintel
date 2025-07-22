import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { ExpoPushToken } from './entities/expo-push-token.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { RegisterExpoPushTokenDto } from './dto/register-expo-push-token.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { RedisService } from 'src/modules/redis/redis.service';
import { paginate } from '../../utils/pagination';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

@Injectable()
export class NotificationService {
    private readonly redis;
    private readonly cachePrefix = 'notifications';
    private readonly expo: Expo;
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        @InjectRepository(ExpoPushToken)
        private readonly expoPushTokenRepository: Repository<ExpoPushToken>,
        private readonly redisService: RedisService,
    ) {
        this.redis = this.redisService.getClient();
        this.expo = new Expo();
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

    // Expo Push Token Management
    async registerExpoPushToken(registerExpoPushTokenDto: RegisterExpoPushTokenDto, user: any) {
        try {
            const { token, deviceInfo } = registerExpoPushTokenDto;

            // Validate the Expo push token
            if (!Expo.isExpoPushToken(token)) {
                return {
                    error: true,
                    data: null,
                    message: 'Invalid Expo push token format',
                };
            }

            // Check if token already exists for this user
            let existingToken = await this.expoPushTokenRepository.findOne({
                where: { token, userId: user.userId },
            });

            if (existingToken) {
                // Update existing token
                existingToken.deviceInfo = deviceInfo;
                existingToken.isActive = true;
                existingToken.lastUsedAt = new Date();
                const data = await this.expoPushTokenRepository.save(existingToken);

                return {
                    error: false,
                    data,
                    message: 'Expo push token updated successfully',
                };
            }

            // Create new token
            const expoPushToken = this.expoPushTokenRepository.create({
                token,
                userId: user.userId,
                deviceInfo,
                isActive: true,
            });

            const data = await this.expoPushTokenRepository.save(expoPushToken);

            return {
                error: false,
                data,
                message: 'Expo push token registered successfully',
            };
        } catch (e) {
            this.logger.error('Error registering Expo push token:', e);
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to register Expo push token',
            };
        }
    }

    async deactivateExpoPushToken(token: string, user: any) {
        try {
            const expoPushToken = await this.expoPushTokenRepository.findOne({
                where: { token, userId: user.userId },
            });

            if (!expoPushToken) {
                return {
                    error: true,
                    data: null,
                    message: 'Expo push token not found',
                };
            }

            expoPushToken.isActive = false;
            const data = await this.expoPushTokenRepository.save(expoPushToken);

            return {
                error: false,
                data,
                message: 'Expo push token deactivated successfully',
            };
        } catch (e) {
            this.logger.error('Error deactivating Expo push token:', e);
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to deactivate Expo push token',
            };
        }
    }

    // Send Push Notifications
    async sendPushNotification(sendNotificationDto: SendNotificationDto) {
        try {
            const { title, body, data, sound, badge } = sendNotificationDto;

            // Get all active Expo push tokens
            const activeTokens = await this.expoPushTokenRepository.find({
                where: { isActive: true },
            });

            if (activeTokens.length === 0) {
                return {
                    error: false,
                    data: { sentCount: 0 },
                    message: 'No active devices to send notifications to',
                };
            }

            // Prepare push messages
            const messages: ExpoPushMessage[] = activeTokens.map((tokenEntity) => ({
                to: tokenEntity.token,
                title,
                body,
                data: data || {},
                sound: sound || 'default',
                badge: badge || 1,
                channelId: 'default',
            }));

            // Send notifications in chunks
            const chunks = this.expo.chunkPushNotifications(messages);
            const tickets: ExpoPushTicket[] = [];

            for (const chunk of chunks) {
                try {
                    const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
                    tickets.push(...ticketChunk);
                } catch (error) {
                    this.logger.error('Error sending push notification chunk:', error);
                }
            }

            // Save notification record
            const notification = this.notificationRepository.create({
                title,
                body,
                data: data || {},
                type: 'push_notification',
                deliveryStatus: 'sent',
            });

            const savedNotification = await this.notificationRepository.save(notification);

            // Update last used timestamp for tokens
            const successfulTokens = activeTokens.filter((_, index) =>
                tickets[index] && tickets[index].status === 'ok'
            );

            if (successfulTokens.length > 0) {
                await this.expoPushTokenRepository
                    .createQueryBuilder()
                    .update(ExpoPushToken)
                    .set({ lastUsedAt: new Date() })
                    .where('id IN (:...ids)', { ids: successfulTokens.map(t => t.id) })
                    .execute();
            }

            // Clear cache
            await this.clearCachePattern(`${this.cachePrefix}:*`);

            return {
                error: false,
                data: {
                    notificationId: savedNotification.notificationId,
                    sentCount: tickets.filter(ticket => ticket.status === 'ok').length,
                    totalRecipients: activeTokens.length,
                    tickets,
                },
                message: 'Push notification sent successfully',
            };
        } catch (e) {
            this.logger.error('Error sending push notification:', e);
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to send push notification',
            };
        }
    }

    // Send notification when new post is created
    async sendPostNotification(postTitle: string, postAuthor: string, postId: number) {
        try {
            const notificationData = {
                title: 'Bài viết mới',
                body: `${postAuthor} vừa đăng bài viết: "${postTitle}"`,
                data: {
                    type: 'NEW_POST',
                    postId: postId,
                    timestamp: new Date().toISOString(),
                },
                sound: 'default',
                badge: 1,
            };

            return await this.sendPushNotification(notificationData);
        } catch (e) {
            this.logger.error('Error sending post notification:', e);
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to send post notification',
            };
        }
    }

    // CRUD operations for notifications
    async create(createNotificationDto: CreateNotificationDto, user: any) {
        try {
            const notification = this.notificationRepository.create({
                ...createNotificationDto,
                userId: user.userId,
            });
            const data = await this.notificationRepository.save(notification);

            // Clear all related cache keys
            await this.clearCachePattern(`${this.cachePrefix}:*`);

            return {
                error: false,
                data,
                message: 'Notification created successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to create notification',
            };
        }
    }

    async findAll(page: number = 1, pageSize: number = 10): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const data = await this.notificationRepository.find({
                order: { createdAt: 'DESC' },
            });
            const paginated = paginate(data, page, pageSize);
            return {
                error: false,
                data: paginated,
                message: 'All notifications fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch notifications',
            };
        }
    }

    async findByUser(userId: string, page: number = 1, pageSize: number = 10) {
        try {
            const cacheKey = `${this.cachePrefix}:user:${userId}:${page}:${pageSize}`;
            const cached = await this.getFromCache(cacheKey);

            if (cached) {
                return {
                    error: false,
                    data: cached,
                    message: 'User notifications fetched successfully from cache',
                };
            }

            const notifications = await this.notificationRepository.find({
                where: { userId: String(userId) },
                order: { createdAt: 'DESC' },
            });

            const paginated = paginate(notifications, page, pageSize);
            await this.setToCache(cacheKey, paginated, 300); // 5 minutes cache

            return {
                error: false,
                data: paginated,
                message: 'User notifications fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch user notifications',
            };
        }
    }

    async findOne(id: number) {
        try {
            const data = await this.notificationRepository.findOne({
                where: { notificationId: id },
                relations: ['user']
            });

            if (!data) {
                return {
                    error: true,
                    data: null,
                    message: 'Notification not found',
                };
            }

            return {
                error: false,
                data,
                message: 'Notification fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch notification',
            };
        }
    }

    async markAsRead(id: number, user: any) {
        try {
            const notification = await this.notificationRepository.findOne({
                where: { notificationId: id, userId: user.userId }
            });

            if (!notification) {
                return {
                    error: true,
                    data: null,
                    message: 'Notification not found or access denied'
                };
            }

            notification.isRead = true;
            const data = await this.notificationRepository.save(notification);

            // Clear cache
            await this.clearCachePattern(`${this.cachePrefix}:user:${user.userId}:*`);

            return {
                error: false,
                data,
                message: 'Notification marked as read',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to mark notification as read',
            };
        }
    }

    async markAllAsRead(user: any) {
        try {
            await this.notificationRepository
                .createQueryBuilder()
                .update(Notification)
                .set({ isRead: true })
                .where('userId = :userId AND isRead = false', { userId: user.userId })
                .execute();

            // Clear cache
            await this.clearCachePattern(`${this.cachePrefix}:user:${user.userId}:*`);

            return {
                error: false,
                data: null,
                message: 'All notifications marked as read',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to mark all notifications as read',
            };
        }
    }

    async update(id: number, updateNotificationDto: UpdateNotificationDto, user: any) {
        try {
            const notification = await this.notificationRepository.findOne({
                where: { notificationId: id }
            });

            if (!notification) {
                return { error: true, data: null, message: 'Notification not found' };
            }

            if (notification.userId !== String(user.userId)) {
                return {
                    error: true,
                    data: null,
                    message: 'You can only update your own notifications'
                };
            }

            // Convert userId to string if present in updateNotificationDto
            if (updateNotificationDto.userId) {
                updateNotificationDto.userId = String(updateNotificationDto.userId);
            }

            await this.notificationRepository.update(id, updateNotificationDto);
            const data = await this.notificationRepository.findOne({
                where: { notificationId: id }
            });

            // Clear cache
            await this.clearCachePattern(`${this.cachePrefix}:*`);

            return {
                error: false,
                data,
                message: 'Notification updated successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to update notification',
            };
        }
    }

    async remove(id: number, user: any) {
        try {
            const notification = await this.notificationRepository.findOne({
                where: { notificationId: id }
            });

            if (!notification) {
                return { error: true, data: null, message: 'Notification not found' };
            }

            if (notification.userId !== user.userId) {
                return {
                    error: true,
                    data: null,
                    message: 'You can only delete your own notifications'
                };
            }

            const data = await this.notificationRepository.delete(id);

            // Clear cache
            await this.clearCachePattern(`${this.cachePrefix}:*`);

            return {
                error: false,
                data,
                message: 'Notification deleted successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to delete notification',
            };
        }
    }

    // Get notification statistics
    async getNotificationStats(user: any) {
        try {
            const cacheKey = `${this.cachePrefix}:stats:${user.userId}`;
            const cached = await this.getFromCache(cacheKey);

            if (cached) {
                return {
                    error: false,
                    data: cached,
                    message: 'Notification stats fetched successfully from cache',
                };
            }

            const totalCount = await this.notificationRepository.count({
                where: { userId: user.userId }
            });

            const unreadCount = await this.notificationRepository.count({
                where: { userId: user.userId, isRead: false }
            });

            const stats = {
                total: totalCount,
                unread: unreadCount,
                read: totalCount - unreadCount,
            };

            await this.setToCache(cacheKey, stats, 60); // 1 minute cache

            return {
                error: false,
                data: stats,
                message: 'Notification stats fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch notification stats',
            };
        }
    }

    // Get active push tokens count
    async getActivePushTokensCount() {
        try {
            const count = await this.expoPushTokenRepository.count({
                where: { isActive: true }
            });

            return {
                error: false,
                data: { count },
                message: 'Active push tokens count fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch active push tokens count',
            };
        }
    }

}
