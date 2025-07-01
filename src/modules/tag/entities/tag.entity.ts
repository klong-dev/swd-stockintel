import { Post } from 'src/modules/post/entities/post.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity()
export class Tag {
    @PrimaryGeneratedColumn({ name: 'tag_id' })
    tagId: string;

    @Column({ name: 'name', type: 'varchar', length: 100, unique: true })
    name: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string | null;

    @OneToOne(() => Post, post => post.tag, {
        nullable: true
    })
    post: Post | null;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}