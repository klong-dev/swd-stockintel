import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  @ApiOperation({ summary: 'Create a new report' })
  @ApiBody({ type: CreateReportDto })
  @ApiResponse({ status: 201, description: 'Report created.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createReportDto: CreateReportDto, @Req() req) {
    return this.reportService.create(createReportDto, req.user);
  }

  @ApiOperation({ summary: 'Get all reports' })
  @ApiResponse({ status: 200, description: 'List of reports.' })
  @Get()
  findAll(@Query('page') page: string = '1', @Query('pageSize') pageSize: string = '10') {
    return this.reportService.findAll(Number(page), Number(pageSize));
  }

  @ApiOperation({ summary: 'Get report by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Report found.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update report by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateReportDto })
  @ApiResponse({ status: 200, description: 'Report updated.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto, @Req() req) {
    return this.reportService.update(+id, updateReportDto, req.user);
  }

  @ApiOperation({ summary: 'Delete report by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Report deleted.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.reportService.remove(+id, req.user);
  }
}
