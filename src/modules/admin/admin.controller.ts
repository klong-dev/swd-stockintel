import { Controller, Get, Post as HttpPost, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AdminGuard } from 'src/guards/admin.guard';
import { GetAdmin } from 'src/decorators/admin.decorator';
import { CreatePostDto } from '../post/dto/create-post.dto';
import { UpdatePostDto } from '../post/dto/update-post.dto';
import { AdminCreatePostDto } from './dto/admin-create-post.dto';
import { AdminUpdatePostDto } from './dto/admin-update-post.dto';
import { AdminPostFilterDto } from './dto/admin-post-filter.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { BulkUpdatePostDto, BulkDeletePostDto } from './dto/bulk-action.dto';
import { UserStatisticsResponseDto } from './dto/user-statistics.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @ApiOperation({ summary: 'Admin: Get all posts with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of posts per page' })
  @ApiResponse({ status: 200, description: 'All posts fetched successfully' })
  @UseGuards(AdminGuard)
  @Get('posts')
  async getAllPosts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;
    return this.adminService.getAllPosts(pageNum, pageSizeNum);
  }

  @ApiOperation({ summary: 'Admin: Get posts and users statistics' })
  @ApiResponse({ status: 200, description: 'Posts and users statistics fetched successfully' })
  @UseGuards(AdminGuard)
  @Get('posts/statistics')
  async getPostsStatistics() {
    return this.adminService.getPostsStatistics();
  }

  @ApiOperation({ summary: 'Admin: Get detailed users statistics' })
  @ApiResponse({
    status: 200,
    description: 'Users statistics fetched successfully',
    type: UserStatisticsResponseDto
  })
  @UseGuards(AdminGuard)
  @Get('users/statistics')
  async getUsersStatistics() {
    return this.adminService.getUsersStatistics();
  }

  @ApiOperation({ summary: 'Admin: Get reported posts' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of posts per page' })
  @ApiResponse({ status: 200, description: 'Reported posts fetched successfully' })
  @UseGuards(AdminGuard)
  @Get('posts/reported')
  async getReportedPosts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;
    return this.adminService.getReportedPosts(pageNum, pageSizeNum);
  }

  @ApiOperation({ summary: 'Admin: Get blocked posts' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of posts per page' })
  @ApiResponse({ status: 200, description: 'Blocked posts fetched successfully' })
  @UseGuards(AdminGuard)
  @Get('posts/blocked')
  async getBlockedPosts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;

    // Validate parsed numbers
    if (isNaN(pageNum) || pageNum < 1) {
      return {
        error: true,
        data: null,
        message: 'Invalid page number',
      };
    }

    if (isNaN(pageSizeNum) || pageSizeNum < 1) {
      return {
        error: true,
        data: null,
        message: 'Invalid page size',
      };
    }

    return this.adminService.getBlockedPosts(pageNum, pageSizeNum);
  }

  @ApiOperation({ summary: 'Admin: Get posts by status (reported posts)' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Post status filter (active, hidden, reported, draft, blocked, deleted)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of posts per page' })
  @ApiResponse({ status: 200, description: 'Posts filtered by status' })
  @UseGuards(AdminGuard)
  @Get('posts/status/filter')
  async getPostsByStatus(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;
    return this.adminService.getPostsByStatus(status, pageNum, pageSizeNum);
  }

  @ApiOperation({ summary: 'Admin: Get post by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post fetched successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @UseGuards(AdminGuard)
  @Get('posts/:id')
  async getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getPostById(id);
  }

  @ApiOperation({ summary: 'Admin: Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @UseGuards(AdminGuard)
  @HttpPost('posts')
  async createPost(@Body() createPostDto: AdminCreatePostDto) {
    return this.adminService.createPost(createPostDto);
  }

  @ApiOperation({ summary: 'Admin: Update post by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @UseGuards(AdminGuard)
  @Patch('posts/:id')
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: AdminUpdatePostDto,
  ) {
    return this.adminService.updatePost(id, updatePostDto);
  }

  @ApiOperation({ summary: 'Admin: Delete post by ID (block post)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post blocked successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @UseGuards(AdminGuard)
  @Delete('posts/:id')
  async deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deletePost(id);
  }

  @ApiOperation({ summary: 'Admin: Restore blocked post by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post restored successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @UseGuards(AdminGuard)
  @Patch('posts/:id/restore')
  async restorePost(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.restorePost(id);
  }

  @ApiOperation({ summary: 'Admin: Toggle post visibility/status' })
  @ApiParam({ name: 'id', type: 'number', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post status updated successfully' })
  @UseGuards(AdminGuard)
  @Patch('posts/:id/toggle-status')
  async togglePostStatus(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.togglePostStatus(id);
  }

  @ApiOperation({ summary: 'Admin: Advanced search and filter posts' })
  @ApiResponse({ status: 200, description: 'Posts search results' })
  @UseGuards(AdminGuard)
  @HttpPost('posts/search')
  async searchAndFilterPosts(@Body() filterDto: AdminPostFilterDto) {
    return this.adminService.searchAndFilterPosts(filterDto);
  }

  @ApiOperation({ summary: 'Admin: Bulk update posts' })
  @ApiResponse({ status: 200, description: 'Posts updated successfully' })
  @UseGuards(AdminGuard)
  @Patch('posts/bulk-update')
  async bulkUpdatePosts(@Body() bulkUpdateDto: BulkUpdatePostDto) {
    return this.adminService.bulkUpdatePosts(bulkUpdateDto.postIds, bulkUpdateDto.updateData);
  }

  @ApiOperation({ summary: 'Admin: Bulk delete posts (block posts)' })
  @ApiResponse({ status: 200, description: 'Posts blocked successfully' })
  @UseGuards(AdminGuard)
  @Delete('posts/bulk-delete')
  async bulkDeletePosts(@Body() bulkDeleteDto: BulkDeletePostDto) {
    return this.adminService.bulkDeletePosts(bulkDeleteDto.postIds);
  }

  @ApiOperation({ summary: 'Admin: Bulk restore posts (unblock posts)' })
  @ApiResponse({ status: 200, description: 'Posts restored successfully' })
  @UseGuards(AdminGuard)
  @Patch('posts/bulk-restore')
  async bulkRestorePosts(@Body() bulkDeleteDto: BulkDeletePostDto) {
    return this.adminService.bulkRestorePosts(bulkDeleteDto.postIds);
  }

  @ApiOperation({ summary: 'Admin: Login' })
  @ApiResponse({ status: 200, description: 'Admin login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @HttpPost('login')
  async adminLogin(@Body() loginDto: AdminLoginDto) {
    return this.adminService.adminLogin(loginDto);
  }

  @ApiOperation({ summary: 'Admin: Get current admin profile' })
  @ApiResponse({ status: 200, description: 'Admin profile fetched successfully' })
  @UseGuards(AdminGuard)
  @Get('profile')
  async getAdminProfile(@GetAdmin() admin: any) {
    return {
      error: false,
      data: {
        id: admin.id,
        username: admin.username,
        status: admin.status,
      },
      message: 'Admin profile fetched successfully',
    };
  }

  @ApiOperation({ summary: 'Admin: Get deleted users' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of users per page' })
  @ApiResponse({ status: 200, description: 'Deleted users fetched successfully' })
  @UseGuards(AdminGuard)
  @Get('users/deleted')
  async getDeletedUsers(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;

    // Validate parsed numbers
    if (isNaN(pageNum) || pageNum < 1) {
      return {
        error: true,
        data: null,
        message: 'Invalid page number',
      };
    }

    if (isNaN(pageSizeNum) || pageSizeNum < 1) {
      return {
        error: true,
        data: null,
        message: 'Invalid page size',
      };
    }

    return this.adminService.getDeletedUsers(pageNum, pageSizeNum);
  }

  @ApiOperation({ summary: 'Admin: Delete user by ID (soft delete)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(AdminGuard)
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @ApiOperation({ summary: 'Admin: Restore deleted user by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User restored successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(AdminGuard)
  @Patch('users/:id/restore')
  async restoreUser(@Param('id') id: string) {
    return this.adminService.restoreUser(id);
  }

  @ApiOperation({ summary: 'Admin: Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of users per page' })
  @ApiResponse({ status: 200, description: 'All users fetched successfully' })
  @UseGuards(AdminGuard)
  @Get('users')
  async getAllUsers(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;

    // Validate parsed numbers
    if (isNaN(pageNum) || pageNum < 1) {
      return {
        error: true,
        data: null,
        message: 'Invalid page number',
      };
    }

    if (isNaN(pageSizeNum) || pageSizeNum < 1) {
      return {
        error: true,
        data: null,
        message: 'Invalid page size',
      };
    }

    return this.adminService.getAllUsers(pageNum, pageSizeNum);
  }
}


