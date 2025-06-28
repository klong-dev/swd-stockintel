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
  @ApiResponse({ status: 201, description: 'Stock created.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @ApiOperation({ summary: 'Get all stocks' })
  @ApiResponse({ status: 200, description: 'List of stocks.' })
  @Get()
  findAll(@Query('page') page: string = '1', @Query('pageSize') pageSize: string = '10') {
    return this.stockService.findAll(Number(page), Number(pageSize));
  }

  @ApiOperation({ summary: 'Get stock by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Stock found.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update stock by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateStockDto })
  @ApiResponse({ status: 200, description: 'Stock updated.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.stockService.update(+id, updateStockDto);
  }

  @ApiOperation({ summary: 'Delete stock by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Stock deleted.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockService.remove(+id);
  }
}
