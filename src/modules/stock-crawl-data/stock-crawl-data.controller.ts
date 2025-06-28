import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { StockCrawlDataService } from './stock-crawl-data.service';
import { CreateStockCrawlDataDto } from './dto/create-stock-crawl-data.dto';
import { UpdateStockCrawlDataDto } from './dto/update-stock-crawl-data.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Stock Crawl Data')
@ApiBearerAuth()
@Controller('stock-crawl-data')
export class StockCrawlDataController {
  constructor(private readonly stockCrawlDataService: StockCrawlDataService) { }

  @ApiOperation({ summary: 'Create a new stock crawl data' })
  @ApiBody({ type: CreateStockCrawlDataDto })
  @ApiResponse({ status: 201, description: 'Stock crawl data created.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createStockCrawlDataDto: CreateStockCrawlDataDto) {
    return this.stockCrawlDataService.create(createStockCrawlDataDto);
  }

  @ApiOperation({ summary: 'Get all stock crawl data' })
  @ApiResponse({ status: 200, description: 'List of stock crawl data.' })
  @Get()
  findAll(@Query('page') page: string = '1', @Query('pageSize') pageSize: string = '10') {
    return this.stockCrawlDataService.findAll(Number(page), Number(pageSize));
  }

  @ApiOperation({ summary: 'Get stock crawl data by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Stock crawl data found.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockCrawlDataService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update stock crawl data by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateStockCrawlDataDto })
  @ApiResponse({ status: 200, description: 'Stock crawl data updated.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStockCrawlDataDto: UpdateStockCrawlDataDto) {
    return this.stockCrawlDataService.update(+id, updateStockCrawlDataDto);
  }

  @ApiOperation({ summary: 'Delete stock crawl data by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Stock crawl data deleted.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockCrawlDataService.remove(+id);
  }
}
