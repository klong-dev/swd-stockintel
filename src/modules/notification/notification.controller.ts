import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @ApiOperation({ summary: 'Create a new notification' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({
    status: 201,
    description: 'Notification created.',
    schema: {
      example: {
        error: false,
        data: { notificationId: 1, title: 'Notification Title', content: 'Notification content' },
        message: 'Notification created successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to create notification.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to create notification',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto, @Req() req) {
    return this.notificationService.create(createNotificationDto, req.user);
  }

  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({
    status: 200,
    description: 'All notifications fetched successfully',
    schema: {
      example: {
        error: false,
        data: {
          items: [
            { notificationId: 1, title: 'Notification Title', content: 'Notification content' }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        },
        message: 'All notifications fetched successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to fetch notifications.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to fetch notifications',
      },
    },
  })
  @Get()
  findAll(@Query('page') page: string = '1', @Query('pageSize') pageSize: string = '10') {
    return this.notificationService.findAll(Number(page), Number(pageSize));
  }

  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Notification fetched successfully',
    schema: {
      example: {
        error: false,
        data: { notificationId: 1, title: 'Notification Title', content: 'Notification content' },
        message: 'Notification fetched successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Notification not found',
      },
    },
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update notification by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateNotificationDto })
  @ApiResponse({
    status: 200,
    description: 'Notification updated successfully',
    schema: {
      example: {
        error: false,
        data: { notificationId: 1, title: 'Notification Title', content: 'Notification content' },
        message: 'Notification updated successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Notification not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to update notification.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to update notification',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto, @Req() req) {
    return this.notificationService.update(+id, updateNotificationDto, req.user);
  }

  @ApiOperation({ summary: 'Delete notification by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
    schema: {
      example: {
        error: false,
        data: {},
        message: 'Notification deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Notification not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to delete notification.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to delete notification',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.notificationService.remove(+id, req.user);
  }
}
