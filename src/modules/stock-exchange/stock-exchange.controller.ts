import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
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
  @ApiResponse({ status: 201, description: 'Stock exchange created.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createStockExchangeDto: CreateStockExchangeDto) {
    return this.stockExchangeService.create(createStockExchangeDto);
  }

  @ApiOperation({ summary: 'Get all stock exchanges' })
  @ApiResponse({ status: 200, description: 'List of stock exchanges.' })
  @Get()
  findAll() {
    return this.stockExchangeService.findAll();
  }

  @ApiOperation({ summary: 'Get stock exchange by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Stock exchange found.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockExchangeService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update stock exchange by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateStockExchangeDto })
  @ApiResponse({ status: 200, description: 'Stock exchange updated.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStockExchangeDto: UpdateStockExchangeDto) {
    return this.stockExchangeService.update(+id, updateStockExchangeDto);
  }

  @ApiOperation({ summary: 'Delete stock exchange by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Stock exchange deleted.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockExchangeService.remove(+id);
  }
}
