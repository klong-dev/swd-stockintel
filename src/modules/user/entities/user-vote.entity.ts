import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Post } from '../../post/entities/post.entity';

@Entity('user_vote')
@Unique(['userId', 'postId'])
export class UserVote {
    @PrimaryGeneratedColumn({ name: 'vote_id' })
    voteId: number;

    @Column({ name: 'user_id', type: 'varchar', length: 50 })
    userId: string;

    @Column({ name: 'post_id', type: 'int' })
    postId: number;

    @Column({ name: 'vote_type', type: 'enum', enum: ['UPVOTE', 'DOWNVOTE'] })
    voteType: 'UPVOTE' | 'DOWNVOTE';

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @ManyToOne(() => User, user => user.votes)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Post, post => post.votes)
    @JoinColumn({ name: 'post_id' })
    post: Post;
}
