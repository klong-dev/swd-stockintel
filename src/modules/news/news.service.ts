import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import { Tag } from '../tag/entities/tag.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async findAll(): Promise<News[]> {
    return this.newsRepository.find();
  }

  async findOne(id: number): Promise<News> {
    return this.newsRepository.findOne({ where: { newsId: id } });
  }

  async remove(id: number): Promise<void> {
    await this.newsRepository.delete(id);
  }
}
