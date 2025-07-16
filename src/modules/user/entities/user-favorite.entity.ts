import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Post } from '../../post/entities/post.entity';

@Entity('user_favorite')
@Unique(['userId', 'postId'])
export class UserFavorite {
    @PrimaryGeneratedColumn({ name: 'favorite_id' })
    favoriteId: number;

    @Column({ name: 'user_id', type: 'varchar', length: 50 })
    userId: string;

    @Column({ name: 'post_id', type: 'int' })
    postId: number;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(() => User, user => user.favorites)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Post, post => post.favorites)
    @JoinColumn({ name: 'post_id' })
    post: Post;
}
