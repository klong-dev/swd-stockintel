import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Stock } from '../../stock/entities/stock.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { Report } from '../../report/entities/report.entity';
import { Tag } from '../../tag/entities/tag.entity';

@Entity('post')
export class Post {
    @PrimaryGeneratedColumn({ name: 'post_id' })
    postId: number;

    @Column({ name: 'title', type: 'varchar', length: 255 })
    title: string;

    @Column({ name: 'content', type: 'text', nullable: true })
    content: string | null;

    @Column({ name: 'expert_id', type: 'int', nullable: true })
    expertId: number | null;

    @Column({ name: 'stock_id', type: 'int', nullable: true })
    stockId: number | null;

    @Column({ name: 'source_url', type: 'varchar', length: 255, nullable: true })
    sourceUrl: string | null;

    @Column({ name: 'view_count', type: 'int', nullable: true, default: 0 })
    viewCount: number;

    @Column({ name: 'session', type: 'int', nullable: true, default: 0 })
    session: number;

    @Column({ name: 'like_count', type: 'int', nullable: true, default: 0 })
    likeCount: number;

    @Column({ name: 'created_at', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @ManyToOne(() => User, user => user.posts)
    @JoinColumn({ name: 'expert_id' })
    expert: User;

    @OneToOne(() => Tag, tag => tag.post, {
        nullable: true
    })
    @JoinColumn({ name: 'tagId' })
    tag: Tag | null;

    @Column({ name: 'status', type: 'enum', enum: ['active', 'hidden', 'reported', 'draft', 'deleted', 'blocked'], default: 'active' })
    status: string;

    @ManyToOne(() => Stock, stock => stock.posts)
    @JoinColumn({ name: 'stock_id' })
    stock: Stock;

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];

    @OneToMany(() => Report, report => report.post)
    reports: Report[];
}