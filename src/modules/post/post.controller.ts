import { Controller, Get, Post as HttpPost, Body, Patch, Param, Delete, UseGuards, Req, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { VotePostDto } from './dto/vote-post.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/guards/optional-jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) { }


  @ApiOperation({ summary: 'Create a new post with optional image upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Post title' },
        content: { type: 'string', example: 'Post content' },
        stockId: { type: 'integer', example: 1 },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Optional image file to upload',
        },
      },
      required: ['title'],
    },
  })
  @ApiResponse({ status: 201, description: 'The post has been successfully created. Returns the post with Cloudinary image URL if uploaded.' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpPost()
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: any,
    @Req() req
  ) {
    const sourceBuffer = file ? file.buffer : undefined;
    return this.postService.create(createPostDto, req.user, sourceBuffer);
  }

  @ApiOperation({ summary: 'Get all posts with user interaction status' })
  @ApiResponse({
    status: 200,
    description: 'All posts fetched successfully with user vote and favorite status',
    schema: {
      example: {
        error: false,
        data: {
          posts: [
            {
              postId: 1,
              title: 'Post Title',
              content: 'Post content',
              upvoteCount: 10,
              downvoteCount: 2,
              favoriteCount: 5,
              userVoteType: 'UPVOTE',
              userHasVoted: true,
              userHasFavorited: false,
              userVoteCreatedAt: '2025-07-17T10:00:00Z',
              userFavoriteCreatedAt: null
            }
          ],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 1,
            totalPages: 1
          }
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
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Query('page') page: string = '1', @Query('pageSize') pageSize: string = '10', @Req() req) {
    const userId = req.user?.userId; // Extract userId from JWT token if user is authenticated
    return this.postService.findAll(Number(page), Number(pageSize), userId);
  }

  @ApiOperation({ summary: 'Get top viewed posts' })
  @ApiResponse({
    status: 200,
    description: 'Top viewed posts fetched successfully',
    schema: {
      example: {
        error: false,
        data: [
          { postId: 1, title: 'Post Title', content: 'Post content' }
        ],
        message: 'Top viewed posts fetched successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to fetch top viewed posts.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to fetch top viewed posts',
      },
    },
  })
  @Get('top-view')
  findTopViewed(@Query('size') size: string = '10') {
    return this.postService.findTopViewed(Number(size));
  }

  @ApiOperation({ summary: 'Get a post by ID with user interaction status' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Post fetched successfully with user vote and favorite status',
    schema: {
      example: {
        error: false,
        data: {
          postId: 1,
          title: 'Post Title',
          content: 'Post content',
          upvoteCount: 10,
          downvoteCount: 2,
          favoriteCount: 5,
          userVoteType: 'UPVOTE', // 'UPVOTE', 'DOWNVOTE', or null
          userHasVoted: true,
          userHasFavorited: false,
          userVoteCreatedAt: '2025-07-17T10:00:00Z',
          userFavoriteCreatedAt: null
        },
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
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req) {
    const userId = req.user?.userId; // Extract userId from JWT token if user is authenticated
    return this.postService.findOne(+id, userId);
  }

  @ApiOperation({ summary: 'Update a post by ID with optional image upload' })
  @ApiParam({ name: 'id', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Post title' },
        content: { type: 'string', example: 'Post content' },
        stockId: { type: 'integer', example: 1 },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Optional image file to upload',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'The updated post. Returns the post with Cloudinary image URL if uploaded.' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file: any,
    @Req() req
  ) {
    const sourceBuffer = file ? file.buffer : undefined;
    return this.postService.update(+id, updatePostDto, req.user, sourceBuffer);
  }



  @ApiOperation({ summary: 'Delete a post by ID (soft delete)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Post deleted successfully (soft delete)',
    schema: {
      example: {
        error: false,
        data: { postId: 1, title: 'Post title', status: 'deleted' },
        message: 'Post deleted successfully (soft delete)',
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

  @ApiOperation({ summary: 'Restore a post by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Post restored successfully',
    schema: {
      example: {
        error: false,
        data: { postId: 1, title: 'Post title', status: 'active' },
        message: 'Post restored successfully',
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
    description: 'Failed to restore post.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to restore post',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  restore(@Param('id') id: string, @Req() req) {
    return this.postService.restore(+id, req.user);
  }

  @ApiOperation({ summary: 'Favorite a post' })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @ApiResponse({
    status: 200,
    description: 'Post favorited successfully',
    schema: {
      example: {
        error: false,
        data: { favorited: true },
        message: 'Post favorited successfully',
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
    description: 'Post already favorited.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Post already favorited',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @HttpPost(':id/favorite')
  favoritePost(@Param('id') id: string, @Req() req) {
    return this.postService.favoritePost(+id, req.user);
  }

  @ApiOperation({ summary: 'Unfavorite a post' })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @ApiResponse({
    status: 200,
    description: 'Post unfavorited successfully',
    schema: {
      example: {
        error: false,
        data: { favorited: false },
        message: 'Post unfavorited successfully',
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
    description: 'Post not favorited.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Post not favorited',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  unfavoritePost(@Param('id') id: string, @Req() req) {
    return this.postService.unfavoritePost(+id, req.user);
  }

  @ApiOperation({ summary: 'Vote on a post (upvote/downvote)' })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @ApiBody({ type: VotePostDto })
  @ApiResponse({
    status: 200,
    description: 'Vote submitted successfully',
    schema: {
      example: {
        error: false,
        data: { voteType: 'UPVOTE', created: true },
        message: 'Vote added successfully',
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
    description: 'Failed to vote on post.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to vote on post',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @HttpPost(':id/vote')
  votePost(@Param('id') id: string, @Body() votePostDto: VotePostDto, @Req() req) {
    return this.postService.votePost(+id, votePostDto, req.user);
  }

  @ApiOperation({ summary: 'Check user vote status on a specific post' })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @ApiResponse({
    status: 200,
    description: 'User vote status retrieved successfully',
    schema: {
      example: {
        error: false,
        data: {
          hasVoted: true,
          voteType: 'UPVOTE', // 'UPVOTE', 'DOWNVOTE', or null
          votedAt: '2025-07-17T10:00:00Z'
        },
        message: 'User vote status retrieved successfully',
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
  @UseGuards(JwtAuthGuard)
  @Get(':id/vote-status')
  getUserVoteStatus(@Param('id') id: string, @Req() req) {
    return this.postService.getUserVoteStatusForPost(+id, req.user.userId);
  }
}
