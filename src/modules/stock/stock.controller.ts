import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Stocks')
@ApiBearerAuth()
@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) { }

  @ApiOperation({ summary: 'Create a new stock' })
  @ApiBody({ type: CreateStockDto })
  @ApiResponse({
    status: 201,
    description: 'Stock created.',
    schema: {
      example: {
        error: false,
        data: { stockId: 1, symbol: 'AAA', name: 'Company AAA' },
        message: 'Stock created successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to create stock.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to create stock',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @ApiOperation({ summary: 'Get all stocks' })
  @ApiResponse({
    status: 200,
    description: 'All stocks fetched successfully',
    schema: {
      example: {
        error: false,
        data: {
          items: [
            { stockId: 1, symbol: 'AAA', name: 'Company AAA' }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        },
        message: 'All stocks fetched successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to fetch stocks.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to fetch stocks',
      },
    },
  })
  @Get()
  findAll(@Query('page') page: string = '1', @Query('pageSize') pageSize: string = '10') {
    return this.stockService.findAll(Number(page), Number(pageSize));
  }

  @ApiOperation({ summary: 'Get stock by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Stock fetched successfully',
    schema: {
      example: {
        error: false,
        data: { stockId: 1, symbol: 'AAA', name: 'Company AAA' },
        message: 'Stock fetched successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Stock not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Stock not found',
      },
    },
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update stock by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateStockDto })
  @ApiResponse({
    status: 200,
    description: 'Stock updated successfully',
    schema: {
      example: {
        error: false,
        data: { stockId: 1, symbol: 'AAA', name: 'Company AAA' },
        message: 'Stock updated successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Stock not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Stock not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to update stock.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to update stock',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.stockService.update(+id, updateStockDto);
  }

  @ApiOperation({ summary: 'Delete stock by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Stock deleted successfully',
    schema: {
      example: {
        error: false,
        data: {},
        message: 'Stock deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Stock not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Stock not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to delete stock.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to delete stock',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockService.remove(+id);
  }
}
