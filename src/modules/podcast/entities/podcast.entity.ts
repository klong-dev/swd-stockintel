import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PodcastClient } from './podcast-client.entity';

@Entity('podcast')
export class Podcast {
    @PrimaryGeneratedColumn({ name: 'podcast_id' })
    podcastId: number;

    @Column({ name: 'title', type: 'varchar', length: 255 })
    title: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string | null;

    @Column({ name: 'audio_url', type: 'varchar', length: 500 })
    audioUrl: string;

    @Column({ name: 'duration', type: 'int', nullable: true, comment: 'Duration in seconds' })
    duration: number | null;

    @Column({ name: 'file_size', type: 'bigint', nullable: true, comment: 'File size in bytes' })
    fileSize: number | null;

    @Column({ name: 'file_format', type: 'varchar', length: 10, nullable: true })
    fileFormat: string | null;

    @Column({ name: 'status', type: 'enum', enum: ['draft', 'published', 'archived'], default: 'published' })
    status: 'draft' | 'published' | 'archived';

    @Column({ name: 'play_count', type: 'int', default: 0 })
    playCount: number;

    @Column({ name: 'is_featured', type: 'boolean', default: false })
    isFeatured: boolean;

    @Column({ name: 'tags', type: 'simple-json', nullable: true })
    tags: string[] | null;

    @Column({ name: 'client_id', type: 'int' })
    clientId: number;

    @Column({ name: 'uploaded_by', type: 'varchar', length: 100, nullable: true, comment: 'Client identifier or external user ID' })
    uploadedBy: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => PodcastClient, client => client.podcasts)
    @JoinColumn({ name: 'client_id' })
    client: PodcastClient;
}
