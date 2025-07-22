import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('expo_push_tokens')
@Index(['token'], { unique: true })
export class ExpoPushToken {
    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column({ name: 'token', type: 'varchar', length: 255, unique: true })
    token: string;

    @Column({ name: 'user_id', type: 'varchar', length: 50, nullable: true })
    userId: string | null;

    @Column({ name: 'device_info', type: 'json', nullable: true })
    deviceInfo: {
        platform?: string;
        appVersion?: string;
        deviceModel?: string;
    } | null;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
    lastUsedAt: Date | null;
}
