import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('notification')
export class Notification {
    @PrimaryGeneratedColumn({ name: 'notification_id' })
    notificationId: number;

    @Column({ name: 'title', type: 'varchar', length: 255 })
    title: string;

    @Column({ name: 'body', type: 'text' })
    body: string;

    @Column({ name: 'data', type: 'json', nullable: true })
    data: {
        type?: string;
        postId?: number;
        url?: string;
        [key: string]: any;
    } | null;

    @Column({ name: 'user_id', type: 'varchar', length: 50, nullable: true })
    userId: string | null;

    @Column({ name: 'type', type: 'varchar', length: 50 })
    type: string; // 'new_post', 'comment', 'like', etc.

    @Column({ name: 'related_id', type: 'int', nullable: true })
    relatedId: number | null;

    @Column({ name: 'is_read', type: 'boolean', default: false })
    isRead: boolean;

    @Column({ name: 'expo_ticket_id', type: 'varchar', length: 255, nullable: true })
    expoTicketId: string | null;

    @Column({ name: 'delivery_status', type: 'enum', enum: ['pending', 'sent', 'delivered', 'failed'], default: 'pending' })
    deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => User, user => user.notifications, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User | null;
}