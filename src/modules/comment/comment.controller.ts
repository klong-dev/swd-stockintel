import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ReplyCommentDto } from './dto/reply-comment.dto';
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
    return this.commentService.create(createCommentDto, req.user);
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
  findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('includeReplies') includeReplies: string = 'false'
  ) {
    return this.commentService.findAll(Number(page), Number(pageSize), includeReplies === 'true');
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
  findOne(
    @Param('id') id: string,
    @Query('includeReplies') includeReplies: string = 'false'
  ) {
    return this.commentService.findOne(+id, includeReplies === 'true');
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
    return this.commentService.update(+id, updateCommentDto, req.user);
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
    return this.commentService.remove(+id, req.user);
  }

  @ApiOperation({ summary: 'Reply to a comment' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the parent comment to reply to' })
  @ApiBody({ type: ReplyCommentDto })
  @ApiResponse({
    status: 201,
    description: 'Reply created successfully.',
    schema: {
      example: {
        error: false,
        data: {
          commentId: 2,
          content: 'This is a reply',
          userId: 'user123',
          parentCommentId: 1,
          postId: 1,
          createdAt: '2025-07-16T17:30:00Z'
        },
        message: 'Reply created successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Parent comment not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Parent comment not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to create reply.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to create reply',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post(':id/reply')
  replyToComment(@Param('id') id: string, @Body() replyCommentDto: ReplyCommentDto, @Req() req) {
    return this.commentService.replyToComment(+id, replyCommentDto.content, req.user);
  }

  @ApiOperation({ summary: 'Get all replies to a comment' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the parent comment' })
  @ApiResponse({
    status: 200,
    description: 'Replies fetched successfully',
    schema: {
      example: {
        error: false,
        data: {
          items: [
            {
              commentId: 2,
              content: 'This is a reply',
              userId: 'user123',
              parentCommentId: 1,
              user: { userId: 'user123', username: 'john_doe' }
            }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        },
        message: 'Replies fetched successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to fetch replies.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to fetch replies',
      },
    },
  })
  @Get(':id/replies')
  getReplies(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10'
  ) {
    return this.commentService.getReplies(+id, Number(page), Number(pageSize));
  }
}
