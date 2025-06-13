import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('notification')
export class Notification {
    @PrimaryGeneratedColumn({ name: 'notification_id' })
    notificationId: number;

    @Column({ name: 'user_id', type: 'int' })
    userId: number;

    @Column({ name: 'type', type: 'varchar', length: 50 })
    type: string;

    @Column({ name: 'related_id', type: 'int', nullable: true })
    relatedId: number | null;

    @Column({ name: 'is_read', type: 'boolean', default: false })
    isRead: boolean;

    @Column({ name: 'created_at', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(() => User, user => user.notifications)
    @JoinColumn({ name: 'user_id' })
    user: User;
}