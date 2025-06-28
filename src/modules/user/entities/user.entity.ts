import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { Report } from '../../report/entities/report.entity';

@Entity('user')
export class User {
    @PrimaryGeneratedColumn({ name: 'user_id' })
    userId: number;

    @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ name: 'provider', type: 'varchar', length: 50, nullable: true })
    provider: string | null;

    @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
    passwordHash: string | null;

    @Column({ name: 'full_name', type: 'varchar', length: 100, nullable: true })
    fullName: string | null;

    @Column({ name: 'avatar_url', type: 'varchar', length: 255, nullable: true })
    avatarUrl: string | null;

    @Column({ name: 'social_id', type: 'varchar', length: 100, nullable: true })
    socialId: string | null;

    @Column({ name: 'status', type: 'varchar', length: 50, nullable: true })
    status: string | null;

    @Column({ name: 'is_expert', type: 'boolean', default: false, nullable: true })
    isExpert: boolean | null;

    @Column({ name: 'created_at', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ name: 'refresh_token', type: 'varchar', length: 500, nullable: true })
    refreshToken: string | null;

    @OneToMany(() => Post, post => post.expert)
    posts: Post[];

    @OneToMany(() => Comment, comment => comment.user)
    comments: Comment[];

    @OneToMany(() => Notification, notification => notification.user)
    notifications: Notification[];

    @OneToMany(() => Report, report => report.user)
    reports: Report[];
}