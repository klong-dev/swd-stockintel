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
  @ApiResponse({
    status: 201,
    description: 'Stock crawl data created.',
    schema: {
      example: {
        error: false,
        data: { stockCrawlDataId: 1, symbol: 'AAA', date: '2024-01-01', open: 100, close: 110 },
        message: 'Stock crawl data created successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to create stock crawl data.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to create stock crawl data',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createStockCrawlDataDto: CreateStockCrawlDataDto) {
    return this.stockCrawlDataService.create(createStockCrawlDataDto);
  }

  @ApiOperation({ summary: 'Get all stock crawl data' })
  @ApiResponse({
    status: 200,
    description: 'All stock crawl data fetched successfully',
    schema: {
      example: {
        error: false,
        data: {
          items: [
            { stockCrawlDataId: 1, symbol: 'AAA', date: '2024-01-01', open: 100, close: 110 }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        },
        message: 'All stock crawl data fetched successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to fetch stock crawl data.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to fetch stock crawl data',
      },
    },
  })
  @Get()
  findAll(@Query('page') page: string = '1', @Query('pageSize') pageSize: string = '10') {
    return this.stockCrawlDataService.findAll(Number(page), Number(pageSize));
  }

  @ApiOperation({ summary: 'Get stock crawl data by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Stock crawl data fetched successfully',
    schema: {
      example: {
        error: false,
        data: { stockCrawlDataId: 1, symbol: 'AAA', date: '2024-01-01', open: 100, close: 110 },
        message: 'Stock crawl data fetched successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Stock crawl data not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Stock crawl data not found',
      },
    },
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockCrawlDataService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update stock crawl data by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateStockCrawlDataDto })
  @ApiResponse({
    status: 200,
    description: 'Stock crawl data updated successfully',
    schema: {
      example: {
        error: false,
        data: { stockCrawlDataId: 1, symbol: 'AAA', date: '2024-01-01', open: 100, close: 110 },
        message: 'Stock crawl data updated successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Stock crawl data not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Stock crawl data not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to update stock crawl data.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to update stock crawl data',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStockCrawlDataDto: UpdateStockCrawlDataDto) {
    return this.stockCrawlDataService.update(+id, updateStockCrawlDataDto);
  }

  @ApiOperation({ summary: 'Delete stock crawl data by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Stock crawl data deleted successfully',
    schema: {
      example: {
        error: false,
        data: {},
        message: 'Stock crawl data deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Stock crawl data not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Stock crawl data not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to delete stock crawl data.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to delete stock crawl data',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockCrawlDataService.remove(+id);
  }
}
