import { Controller, Get, Post as HttpPost, Body, Patch, Param, Delete, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
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

  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, description: 'List of posts.' })
  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'The found post.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
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
        sourceUrl: { type: 'string', example: 'https://...' },
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

  @ApiOperation({ summary: 'Delete a post by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'The post has been deleted.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.postService.remove(+id, req.user);
  }
}
