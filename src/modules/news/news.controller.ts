import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { News } from './entities/news.entity';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAll(): Promise<News[]> {
    return this.newsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<News> {
    return this.newsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.newsService.remove(id);
  }
}
