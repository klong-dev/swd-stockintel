import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { News } from './entities/news.entity';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả tin tức' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tin tức',
    type: News,
    isArray: true,
  })
  async findAll(): Promise<{ error: boolean; data: News[]; message: string }> {
    return this.newsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một tin tức theo ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID của tin tức' })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết tin tức',
    type: News,
  })
  async findOne(
    @Param('id') id: number,
  ): Promise<{ error: boolean; data: News; message: string }> {
    return this.newsService.findOne(id);
  }

  @Get('tag/:tagId')
  @ApiOperation({ summary: 'Lấy danh sách tin tức theo tagId' })
  @ApiParam({ name: 'tagId', required: true, description: 'ID của tag' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tin tức theo tag',
    type: News,
    isArray: true,
  })
  async findByTagId(
    @Param('tagId') tagId: number,
  ): Promise<{ error: boolean; data: News[]; message: string }> {
    return this.newsService.findByTagId(tagId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một tin tức theo ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID của tin tức' })
  @ApiResponse({
    status: 200,
    description: 'Kết quả xóa tin tức',
  })
  async remove(
    @Param('id') id: number,
  ): Promise<{ error: boolean; data: any; message: string }> {
    return this.newsService.remove(id);
  }
}
