import { Controller, Get, Post as HttpPost, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({
    status: 201,
    description: 'Post created.',
    schema: {
      example: {
        error: false,
        data: { postId: 1, title: 'Post Title', content: 'Post content' },
        message: 'Post created successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to create post.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to create post',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @HttpPost()
  create(@Body() createPostDto: CreatePostDto, @Req() req) {
    return this.postService.create(createPostDto, req.user);
  }

  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({
    status: 200,
    description: 'All posts fetched successfully',
    schema: {
      example: {
        error: false,
        data: {
          items: [
            { postId: 1, title: 'Post Title', content: 'Post content' }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        },
        message: 'All posts fetched successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to fetch posts.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to fetch posts',
      },
    },
  })
  @Get()
  findAll(@Query('page') page: string = '1', @Query('pageSize') pageSize: string = '10') {
    return this.postService.findAll(Number(page), Number(pageSize));
  }

  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Post fetched successfully',
    schema: {
      example: {
        error: false,
        data: { postId: 1, title: 'Post Title', content: 'Post content' },
        message: 'Post fetched successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Post not found',
      },
    },
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a post by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({
    status: 200,
    description: 'Post updated successfully',
    schema: {
      example: {
        error: false,
        data: { postId: 1, title: 'Post Title', content: 'Post content' },
        message: 'Post updated successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Post not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to update post.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to update post',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Req() req) {
    return this.postService.update(+id, updatePostDto, req.user);
  }

  @ApiOperation({ summary: 'Delete a post by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Post deleted successfully',
    schema: {
      example: {
        error: false,
        data: {},
        message: 'Post deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Post not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to delete post.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to delete post',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.postService.remove(+id, req.user);
  }
}
