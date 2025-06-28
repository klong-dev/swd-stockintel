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
  @ApiResponse({
    status: 201,
    description: 'Report created.',
    schema: {
      example: {
        error: false,
        data: { reportId: 1, title: 'Report 1', content: 'Content here' },
        message: 'Report created successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to create report.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to create report',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createReportDto: CreateReportDto, @Req() req) {
    return this.reportService.create(createReportDto, req.user);
  }

  @ApiOperation({ summary: 'Get all reports' })
  @ApiResponse({
    status: 200,
    description: 'All reports fetched successfully',
    schema: {
      example: {
        error: false,
        data: {
          items: [
            { reportId: 1, title: 'Report 1', content: 'Content here' }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        },
        message: 'All reports fetched successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to fetch reports.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to fetch reports',
      },
    },
  })
  @Get()
  findAll(@Query('page') page: string = '1', @Query('pageSize') pageSize: string = '10') {
    return this.reportService.findAll(Number(page), Number(pageSize));
  }

  @ApiOperation({ summary: 'Get report by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Report fetched successfully',
    schema: {
      example: {
        error: false,
        data: { reportId: 1, title: 'Report 1', content: 'Content here' },
        message: 'Report fetched successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Report not found',
      },
    },
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update report by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateReportDto })
  @ApiResponse({
    status: 200,
    description: 'Report updated successfully',
    schema: {
      example: {
        error: false,
        data: { reportId: 1, title: 'Report 1', content: 'Content here' },
        message: 'Report updated successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Report not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to update report.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to update report',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto, @Req() req) {
    return this.reportService.update(+id, updateReportDto, req.user);
  }

  @ApiOperation({ summary: 'Delete report by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Report deleted successfully',
    schema: {
      example: {
        error: false,
        data: {},
        message: 'Report deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Report not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to delete report.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to delete report',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.reportService.remove(+id, req.user);
  }
}
