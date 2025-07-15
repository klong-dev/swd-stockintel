import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { StockExchangeService } from './stock-exchange.service';
import { CreateStockExchangeDto } from './dto/create-stock-exchange.dto';
import { UpdateStockExchangeDto } from './dto/update-stock-exchange.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Stock Exchanges')
@ApiBearerAuth()
@Controller('stock-exchanges')
export class StockExchangeController {
  constructor(private readonly stockExchangeService: StockExchangeService) { }

  @ApiOperation({ summary: 'Create a new stock exchange' })
  @ApiBody({ type: CreateStockExchangeDto })
  @ApiResponse({
    status: 201,
    description: 'Stock exchange created.',
    schema: {
      example: {
        error: false,
        data: { stockExchangeId: 1, name: 'HOSE', country: 'Vietnam' },
        message: 'Stock exchange created successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to create stock exchange.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to create stock exchange',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createStockExchangeDto: CreateStockExchangeDto) {
    return this.stockExchangeService.create(createStockExchangeDto);
  }

  @ApiOperation({ summary: 'Get all stock exchanges' })
  @ApiResponse({
    status: 200,
    description: 'All stock exchanges fetched successfully',
    schema: {
      example: {
        error: false,
        data: {
          items: [
            { stockExchangeId: 1, name: 'HOSE', country: 'Vietnam' }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        },
        message: 'All stock exchanges fetched successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to fetch stock exchanges.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to fetch stock exchanges',
      },
    },
  })
  @Get()
  findAll(@Query('page') page: string = '1', @Query('pageSize') pageSize: string = '10') {
    return this.stockExchangeService.findAll(Number(page), Number(pageSize));
  }

  @ApiOperation({ summary: 'Get stock exchange by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Stock exchange fetched successfully',
    schema: {
      example: {
        error: false,
        data: { stockExchangeId: 1, name: 'HOSE', country: 'Vietnam' },
        message: 'Stock exchange fetched successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Stock exchange not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Stock exchange not found',
      },
    },
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockExchangeService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update stock exchange by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateStockExchangeDto })
  @ApiResponse({
    status: 200,
    description: 'Stock exchange updated successfully',
    schema: {
      example: {
        error: false,
        data: { stockExchangeId: 1, name: 'HOSE', country: 'Vietnam' },
        message: 'Stock exchange updated successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Stock exchange not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Stock exchange not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to update stock exchange.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to update stock exchange',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStockExchangeDto: UpdateStockExchangeDto) {
    return this.stockExchangeService.update(+id, updateStockExchangeDto);
  }

  @ApiOperation({ summary: 'Delete stock exchange by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Stock exchange deleted successfully',
    schema: {
      example: {
        error: false,
        data: {},
        message: 'Stock exchange deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Stock exchange not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Stock exchange not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to delete stock exchange.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to delete stock exchange',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockExchangeService.remove(+id);
  }
}
