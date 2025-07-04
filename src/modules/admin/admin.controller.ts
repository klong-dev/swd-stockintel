import { Controller, Get, Post as HttpPost, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreatePostDto } from '../post/dto/create-post.dto';
import { UpdatePostDto } from '../post/dto/update-post.dto';
import { AdminCreatePostDto } from './dto/admin-create-post.dto';
import { AdminUpdatePostDto } from './dto/admin-update-post.dto';
import { AdminPostFilterDto } from './dto/admin-post-filter.dto';
import { BulkUpdatePostDto, BulkDeletePostDto } from './dto/bulk-action.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @ApiOperation({ summary: 'Admin: Get all posts with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of posts per page' })
  @ApiResponse({ status: 200, description: 'All posts fetched successfully' })
  @UseGuards(JwtAuthGuard)
  @Get('posts')
  async getAllPosts(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 10,
  ) {
    return this.adminService.getAllPosts(page, pageSize);
  }

  @ApiOperation({ summary: 'Admin: Get post by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post fetched successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @UseGuards(JwtAuthGuard)
  @Get('posts/:id')
  async getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getPostById(id);
  }

  @ApiOperation({ summary: 'Admin: Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @UseGuards(JwtAuthGuard)
  @HttpPost('posts')
  async createPost(@Body() createPostDto: AdminCreatePostDto) {
    return this.adminService.createPost(createPostDto);
  }

  @ApiOperation({ summary: 'Admin: Update post by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @UseGuards(JwtAuthGuard)
  @Patch('posts/:id')
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: AdminUpdatePostDto,
  ) {
    return this.adminService.updatePost(id, updatePostDto);
  }

  @ApiOperation({ summary: 'Admin: Delete post by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id')
  async deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deletePost(id);
  }

  @ApiOperation({ summary: 'Admin: Get posts by status (reported posts)' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Post status filter' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of posts per page' })
  @ApiResponse({ status: 200, description: 'Posts filtered by status' })
  @UseGuards(JwtAuthGuard)
  @Get('posts/status/filter')
  async getPostsByStatus(
    @Query('status') status?: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 10,
  ) {
    return this.adminService.getPostsByStatus(status, page, pageSize);
  }

  @ApiOperation({ summary: 'Admin: Get reported posts' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of posts per page' })
  @ApiResponse({ status: 200, description: 'Reported posts fetched successfully' })
  @UseGuards(JwtAuthGuard)
  @Get('posts/reported')
  async getReportedPosts(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 10,
  ) {
    return this.adminService.getReportedPosts(page, pageSize);
  }

  @ApiOperation({ summary: 'Admin: Get posts statistics' })
  @ApiResponse({ status: 200, description: 'Posts statistics fetched successfully' })
  @UseGuards(JwtAuthGuard)
  @Get('posts/statistics')
  async getPostsStatistics() {
    return this.adminService.getPostsStatistics();
  }

  @ApiOperation({ summary: 'Admin: Toggle post visibility/status' })
  @ApiParam({ name: 'id', type: 'number', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post status updated successfully' })
  @UseGuards(JwtAuthGuard)
  @Patch('posts/:id/toggle-status')
  async togglePostStatus(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.togglePostStatus(id);
  }

  @ApiOperation({ summary: 'Admin: Advanced search and filter posts' })
  @ApiResponse({ status: 200, description: 'Posts search results' })
  @UseGuards(JwtAuthGuard)
  @HttpPost('posts/search')
  async searchAndFilterPosts(@Body() filterDto: AdminPostFilterDto) {
    return this.adminService.searchAndFilterPosts(filterDto);
  }

  @ApiOperation({ summary: 'Admin: Bulk update posts' })
  @ApiResponse({ status: 200, description: 'Posts updated successfully' })
  @UseGuards(JwtAuthGuard)
  @Patch('posts/bulk-update')
  async bulkUpdatePosts(@Body() bulkUpdateDto: BulkUpdatePostDto) {
    return this.adminService.bulkUpdatePosts(bulkUpdateDto.postIds, bulkUpdateDto.updateData);
  }

  @ApiOperation({ summary: 'Admin: Bulk delete posts' })
  @ApiResponse({ status: 200, description: 'Posts deleted successfully' })
  @UseGuards(JwtAuthGuard)
  @Delete('posts/bulk-delete')
  async bulkDeletePosts(@Body() bulkDeleteDto: BulkDeletePostDto) {
    return this.adminService.bulkDeletePosts(bulkDeleteDto.postIds);
  }
}
