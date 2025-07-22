import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ValidationPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { RegisterExpoPushTokenDto } from './dto/register-expo-push-token.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AdminGuard } from '../../guards/admin.guard';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  // Expo Push Token Management
  @Post('register-push-token')
  @ApiOperation({ summary: 'Register Expo push token for user' })
  @ApiResponse({ status: 201, description: 'Push token registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid push token format' })
  async registerPushToken(
    @Body(ValidationPipe) registerExpoPushTokenDto: RegisterExpoPushTokenDto,
    @Req() req: any,
  ) {
    return this.notificationService.registerExpoPushToken(registerExpoPushTokenDto, req.user);
  }

  @Delete('push-token/:token')
  @ApiOperation({ summary: 'Deactivate Expo push token' })
  @ApiResponse({ status: 200, description: 'Push token deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Push token not found' })
  async deactivatePushToken(@Param('token') token: string, @Req() req: any) {
    return this.notificationService.deactivateExpoPushToken(token, req.user);
  }

  // Send Notifications (Admin only)
  @Post('send')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Send push notification to all devices (Admin only)' })
  @ApiResponse({ status: 201, description: 'Notification sent successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async sendNotification(@Body(ValidationPipe) sendNotificationDto: SendNotificationDto) {
    return this.notificationService.sendPushNotification(sendNotificationDto);
  }

  // Notification CRUD
  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  async create(
    @Body(ValidationPipe) createNotificationDto: CreateNotificationDto,
    @Req() req: any,
  ) {
    return this.notificationService.create(createNotificationDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async findUserNotifications(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.notificationService.findByUser(req.user.userId, page, pageSize);
  }

  @Get('all')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all notifications (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'All notifications retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async findAll(@Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.notificationService.findAll(page, pageSize);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get notification statistics for current user' })
  @ApiResponse({ status: 200, description: 'Notification stats retrieved successfully' })
  async getStats(@Req() req: any) {
    return this.notificationService.getNotificationStats(req.user);
  }

  @Get('push-tokens/count')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get active push tokens count (Admin only)' })
  @ApiResponse({ status: 200, description: 'Active push tokens count retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getActivePushTokensCount() {
    return this.notificationService.getActivePushTokensCount();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findOne(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationService.markAsRead(+id, req.user);
  }

  @Patch('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Req() req: any) {
    return this.notificationService.markAllAsRead(req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification' })
  @ApiResponse({ status: 200, description: 'Notification updated successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateNotificationDto: UpdateNotificationDto,
    @Req() req: any,
  ) {
    return this.notificationService.update(+id, updateNotificationDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.notificationService.remove(+id, req.user);
  }
}
