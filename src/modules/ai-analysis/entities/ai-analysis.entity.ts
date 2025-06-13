import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ai_analysis')
export class AiAnalysis {
    @PrimaryGeneratedColumn({ name: 'analysis_id' })
    analysisId: number;

    @Column({ name: 'title', type: 'varchar', length: 255 })
    title: string;

    @Column({ name: 'content', type: 'text' })
    content: string;

    @Column({ name: 'confidence_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
    confidenceScore: string | null;

    @Column({ name: 'created_at', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}