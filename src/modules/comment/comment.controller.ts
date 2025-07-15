import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Comments')
@ApiBearerAuth()
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) { }

  @ApiOperation({ summary: 'Create a new comment' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    status: 201,
    description: 'Comment created.',
    schema: {
      example: {
        error: false,
        data: { commentId: 1, content: 'This is a comment', userId: 1 },
        message: 'Comment created successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to create comment.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to create comment',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    return this.commentService.create({ ...createCommentDto, userId: req.user.userId });
  }

  @ApiOperation({ summary: 'Get all comments' })
  @ApiResponse({
    status: 200,
    description: 'All comments fetched successfully',
    schema: {
      example: {
        error: false,
        data: {
          items: [
            { commentId: 1, content: 'This is a comment', userId: 1 }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        },
        message: 'All comments fetched successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to fetch comments.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to fetch comments',
      },
    },
  })
  @Get()
  findAll(@Query('page') page: string = '1', @Query('pageSize') pageSize: string = '10') {
    return this.commentService.findAll(Number(page), Number(pageSize));
  }

  @ApiOperation({ summary: 'Get comment by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Comment fetched successfully',
    schema: {
      example: {
        error: false,
        data: { commentId: 1, content: 'This is a comment', userId: 1 },
        message: 'Comment fetched successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Comment not found',
      },
    },
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update comment by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
    schema: {
      example: {
        error: false,
        data: { commentId: 1, content: 'This is a comment', userId: 1 },
        message: 'Comment updated successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Comment not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to update comment.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to update comment',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto, @Req() req) {
    return this.commentService.update(+id, updateCommentDto);
  }

  @ApiOperation({ summary: 'Delete comment by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully',
    schema: {
      example: {
        error: false,
        data: {},
        message: 'Comment deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Comment not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to delete comment.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to delete comment',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.commentService.remove(+id);
  }
}
