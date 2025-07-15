import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { RedisService } from 'src/modules/redis/redis.service';
import { paginate } from '../../utils/pagination';

@Injectable()
export class NotificationService {
    private readonly redis;
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
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

    async create(createNotificationDto: CreateNotificationDto, user: any) {
        try {
            const notification = this.notificationRepository.create({
                ...createNotificationDto,
                userId: user.userId,
            });
            const data = await this.notificationRepository.save(notification);
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
            const data = await this.notificationRepository.find();
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

    async findOne(id: number) {
        try {
            const data = await this.notificationRepository.findOne({ where: { notificationId: id } });
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

    async update(id: number, updateNotificationDto: UpdateNotificationDto, user: any) {
        try {
            const notification = await this.notificationRepository.findOne({ where: { notificationId: id } });
            if (!notification) return { error: true, data: null, message: 'Notification not found' };
            if (notification.userId !== user.userId) return { error: true, data: null, message: 'You can only update your own notifications' };
            await this.notificationRepository.update(id, updateNotificationDto);
            const data = await this.notificationRepository.findOne({ where: { notificationId: id } });
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
            const notification = await this.notificationRepository.findOne({ where: { notificationId: id } });
            if (!notification) return { error: true, data: null, message: 'Notification not found' };
            if (notification.userId !== user.userId) return { error: true, data: null, message: 'You can only delete your own notifications' };
            const data = await this.notificationRepository.delete(id);
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
}
