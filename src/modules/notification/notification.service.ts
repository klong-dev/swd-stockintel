import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

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

    async findAll() {
        try {
            const data = await this.notificationRepository.find();
            return {
                error: false,
                data,
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
