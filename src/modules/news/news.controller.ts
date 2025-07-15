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
  @ApiOperation({ summary: 'Get all news' })
  @ApiResponse({
    status: 200,
    description: 'List of news',
    type: News,
    isArray: true,
  })
  async findAll(): Promise<{ error: boolean; data: News[]; message: string }> {
    return this.newsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get news details by ID' })
  @ApiParam({ name: 'id', required: true, description: 'News ID' })
  @ApiResponse({
    status: 200,
    description: 'News details',
    type: News,
  })
  async findOne(
    @Param('id') id: number,
  ): Promise<{ error: boolean; data: News; message: string }> {
    return this.newsService.findOne(id);
  }

  @Get('tag/:tagId')
  @ApiOperation({ summary: 'Get news list by tagId' })
  @ApiParam({ name: 'tagId', required: true, description: 'Tag ID' })
  @ApiResponse({
    status: 200,
    description: 'News list by tag',
    type: News,
    isArray: true,
  })
  async findByTagId(
    @Param('tagId') tagId: number,
  ): Promise<{ error: boolean; data: News[]; message: string }> {
    return this.newsService.findByTagId(tagId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete news by ID' })
  @ApiParam({ name: 'id', required: true, description: 'News ID' })
  @ApiResponse({
    status: 200,
    description: 'Delete news result',
  })
  async remove(
    @Param('id') id: number,
  ): Promise<{ error: boolean; data: any; message: string }> {
    return this.newsService.remove(id);
  }
}
