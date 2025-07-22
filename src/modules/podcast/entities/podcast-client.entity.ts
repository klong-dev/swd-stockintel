import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Podcast } from './podcast.entity';

@Entity('podcast_client')
export class PodcastClient {
    @PrimaryGeneratedColumn({ name: 'client_id' })
    clientId: number;

    @Column({ name: 'client_name', type: 'varchar', length: 255 })
    clientName: string;

    @Column({ name: 'secret_key', type: 'varchar', length: 255, unique: true })
    secretKey: string;

    @Column({ name: 'api_key', type: 'varchar', length: 255, unique: true })
    apiKey: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @Column({ name: 'max_storage_mb', type: 'int', default: 1000, comment: 'Maximum storage in MB' })
    maxStorageMb: number;

    @Column({ name: 'used_storage_mb', type: 'int', default: 0, comment: 'Used storage in MB' })
    usedStorageMb: number;

    @Column({ name: 'max_file_size_mb', type: 'int', default: 100, comment: 'Maximum file size in MB' })
    maxFileSizeMb: number;

    @Column({ name: 'allowed_formats', type: 'simple-json', default: ['mp3', 'wav', 'ogg', 'm4a'] })
    allowedFormats: string[];

    @Column({ name: 'rate_limit_per_hour', type: 'int', default: 100 })
    rateLimitPerHour: number;

    @Column({ name: 'contact_email', type: 'varchar', length: 255, nullable: true })
    contactEmail: string | null;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string | null;

    @Column({ name: 'last_access', type: 'timestamp', nullable: true })
    lastAccess: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @OneToMany(() => Podcast, podcast => podcast.client)
    podcasts: Podcast[];
}
