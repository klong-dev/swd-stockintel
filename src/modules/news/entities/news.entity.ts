import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn
} from 'typeorm';
import { Tag } from '../../tag/entities/tag.entity';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn({name: 'news_id'})
  newsId: number;

  @Column({name: 'author', type: 'varchar', length: 100 })
  author: string;

  @Column({name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({name: 'content', type: 'text'})
  content: string;

  @Column({ name: 'source_url', type: 'varchar', length: 255, nullable: true })
  sourceUrl: string;

  @ManyToOne(() => Tag, tag => tag.news)
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
