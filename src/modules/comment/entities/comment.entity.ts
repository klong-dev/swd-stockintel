import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { User } from '../../user/entities/user.entity';
import { Report } from '../../report/entities/report.entity';

@Entity('comment')
export class Comment {
    @PrimaryGeneratedColumn({ name: 'comment_id' })
    commentId: number;

    @Column({ name: 'post_id', type: 'int', nullable: true })
    postId: number | null;

    @Column({ name: 'user_id', type: 'varchar', length: 50, nullable: true })
    userId: string | null;

    @Column({ name: 'parent_comment_id', type: 'int', nullable: true })
    parentCommentId: number | null;

    @Column({ name: 'content', type: 'text' })
    content: string;

    @Column({ name: 'is_edited', type: 'boolean', default: false, nullable: true })
    isEdited: boolean | null;

    @Column({ name: 'like_count', type: 'int', nullable: true })
    likeCount: number | null;

    @Column({ name: 'created_at', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @ManyToOne(() => Post, post => post.comments)
    @JoinColumn({ name: 'post_id' })
    post: Post;

    @ManyToOne(() => User, user => user.comments)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Comment, comment => comment.children)
    @JoinColumn({ name: 'parent_comment_id' })
    parent: Comment;

    @OneToMany(() => Comment, comment => comment.parent)
    children: Comment[];

    @OneToMany(() => Report, report => report.comment)
    reports: Report[];
}