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
        message: 'Lấy danh sách tin tức thành công',
      };
    } catch (e) {
      return {
        error: true,
        data: null,
        message: 'Lỗi khi lấy danh sách tin tức',
      };
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.newsRepository.findOne({ where: { newsId: id } });
      if (!data) {
        return { error: true, data: null, message: 'Không tìm thấy tin tức' };
      }
      return { error: false, data, message: 'Lấy tin tức thành công' };
    } catch (e) {
      return { error: true, data: null, message: 'Lỗi khi lấy tin tức' };
    }
  }

  async remove(id: number) {
    try {
      const result = await this.newsRepository.delete(id);
      if (result.affected === 0) {
        return {
          error: true,
          data: null,
          message: 'Không tìm thấy tin tức để xóa',
        };
      }
      return { error: false, data: null, message: 'Xóa tin tức thành công' };
    } catch (e) {
      return { error: true, data: null, message: 'Lỗi khi xóa tin tức' };
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
        message: 'Lấy danh sách tin tức theo tag thành công',
      };
    } catch (e) {
      return {
        error: true,
        data: null,
        message: 'Lỗi khi lấy tin tức theo tag',
      };
    }
  }
}
