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

  async findAll() {
    try {
      const data = await this.newsRepository.find();
      return {
        error: false,
        data,
        message: 'Get news list successfully',
      };
    } catch (e) {
      return {
        error: true,
        data: null,
        message: 'Error while getting news list',
      };
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.newsRepository.findOne({ where: { newsId: id } });
      if (!data) {
        return { error: true, data: null, message: 'News not found' };
      }
      return { error: false, data, message: 'Get news successfully' };
    } catch (e) {
      return { error: true, data: null, message: 'Error while getting news' };
    }
  }

  async remove(id: number) {
    try {
      const result = await this.newsRepository.delete(id);
      if (result.affected === 0) {
        return {
          error: true,
          data: null,
          message: 'News not found to delete',
        };
      }
      return { error: false, data: null, message: 'Delete news successfully' };
    } catch (e) {
      return { error: true, data: null, message: 'Error while deleting news' };
    }
  }

  async findByTagId(tagId: number) {
    try {
      const data = await this.newsRepository.find({
        where: { tag: { tagId } } as any,
        relations: ['tag'],
      });
      return {
        error: false,
        data,
        message: 'Get news list by tag successfully',
      };
    } catch (e) {
      return {
        error: true,
        data: null,
        message: 'Error while getting news by tag',
      };
    }
  }
}
