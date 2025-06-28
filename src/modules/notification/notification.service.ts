import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { RedisService } from 'src/modules/redis/redis.service';

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

    create(createNotificationDto: CreateNotificationDto, user: any) {
        // Always use the userId from JWT
        const notification = this.notificationRepository.create({
            ...createNotificationDto,
            userId: user.userId,
        });
        return this.notificationRepository.save(notification);
    }

    findAll() {
        return this.notificationRepository.find();
    }

    findOne(id: number) {
        return this.notificationRepository.findOne({ where: { notificationId: id } });
    }

    async update(id: number, updateNotificationDto: UpdateNotificationDto, user: any) {
        const notification = await this.notificationRepository.findOne({ where: { notificationId: id } });
        if (!notification) throw new NotFoundException('Notification not found');
        if (notification.userId !== user.userId) throw new ForbiddenException('You can only update your own notifications');
        await this.notificationRepository.update(id, updateNotificationDto);
        return this.findOne(id);
    }

    async remove(id: number, user: any) {
        const notification = await this.notificationRepository.findOne({ where: { notificationId: id } });
        if (!notification) throw new NotFoundException('Notification not found');
        if (notification.userId !== user.userId) throw new ForbiddenException('You can only delete your own notifications');
        return this.notificationRepository.delete(id);
    }
}
