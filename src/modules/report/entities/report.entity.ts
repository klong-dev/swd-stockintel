import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { User } from '../../user/entities/user.entity';

@Entity('report')
export class Report {
    @PrimaryGeneratedColumn({ name: 'report_id' })
    reportId: number;

    @Column({ name: 'post_id', type: 'int', nullable: true })
    postId: number | null;

    @Column({ name: 'comment_id', type: 'int', nullable: true })
    commentId: number | null;

    @Column({ name: 'user_id', type: 'int' })
    userId: number;

    @Column({ name: 'reason', type: 'varchar', length: 255 })
    reason: string;

    @Column({ name: 'status', type: 'varchar', length: 50, nullable: true })
    status: string | null;

    @Column({ name: 'created_at', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(() => Post, post => post.reports)
    @JoinColumn({ name: 'post_id' })
    post: Post;

    @ManyToOne(() => Comment, comment => comment.reports)
    @JoinColumn({ name: 'comment_id' })
    comment: Comment;

    @ManyToOne(() => User, user => user.reports)
    @JoinColumn({ name: 'user_id' })
    user: User;
}