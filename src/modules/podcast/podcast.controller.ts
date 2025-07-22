import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    Request,
    UseInterceptors,
    UploadedFile,
    ParseIntPipe,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiConsumes,
    ApiBody,
    ApiQuery,
    ApiParam,
    ApiSecurity,
    ApiBearerAuth
} from '@nestjs/swagger';
import { PodcastService } from './podcast.service';
import { CreatePodcastDto } from './dto/create-podcast.dto';
import { UploadPodcastDto } from './dto/upload-podcast.dto';
import { UpdatePodcastDto } from './dto/update-podcast.dto';
import { PodcastAuthGuard } from './guards/podcast-auth.guard';

@ApiTags('Podcasts')
@Controller('podcasts')
export class PodcastController {
    constructor(private readonly podcastService: PodcastService) { }

    @Post('upload')
    @ApiOperation({
        summary: 'Upload a new podcast',
        description: 'Upload an audio file and create a new podcast. Requires valid secretKey in request body.'
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Podcast upload data with audio file',
        schema: {
            type: 'object',
            properties: {
                audio: {
                    type: 'string',
                    format: 'binary',
                    description: 'Audio file (mp3, wav, m4a)',
                },
                title: {
                    type: 'string',
                    description: 'Podcast title',
                },
                description: {
                    type: 'string',
                    description: 'Podcast description',
                },
                uploadedBy: {
                    type: 'string',
                    description: 'Identifier of the uploader (external user ID, client name, etc.)',
                },
                status: {
                    type: 'string',
                    enum: ['draft', 'published', 'archived'],
                    description: 'Podcast status',
                },
                tags: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Podcast tags',
                },
                secretKey: {
                    type: 'string',
                    description: 'Secret key for authentication (required)',
                }
            },
            required: ['audio', 'title', 'secretKey']
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Podcast uploaded successfully',
        schema: {
            type: 'object',
            properties: {
                error: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        podcastId: { type: 'number' },
                        title: { type: 'string' },
                        audioUrl: { type: 'string' },
                        duration: { type: 'number' },
                        status: { type: 'string' }
                    }
                },
                message: { type: 'string' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad request - missing audio file or invalid data' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing secretKey' })
    @ApiResponse({ status: 413, description: 'File too large' })
    @UseInterceptors(FileInterceptor('audio'))
    async uploadPodcast(
        @UploadedFile() audioFile: any,
        @Body() uploadPodcastDto: UploadPodcastDto,
        @Request() req: any,
    ) {
        if (!audioFile) {
            throw new BadRequestException('Audio file is required');
        }

        // The service will handle the secretKey validation internally
        return this.podcastService.uploadPodcast(
            audioFile,
            uploadPodcastDto
        );
    }

    @Get()
    @ApiOperation({
        summary: 'Get all podcasts for authenticated client',
        description: 'Retrieve paginated list of podcasts belonging to the authenticated client'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Items per page (default: 10)' })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: ['draft', 'published', 'archived'],
        description: 'Filter by status'
    })
    @ApiResponse({
        status: 200,
        description: 'Podcasts retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                error: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    podcastId: { type: 'number' },
                                    title: { type: 'string' },
                                    description: { type: 'string' },
                                    audioUrl: { type: 'string' },
                                    duration: { type: 'number' },
                                    status: { type: 'string' },
                                    uploadedBy: { type: 'string' },
                                    createdAt: { type: 'string' }
                                }
                            }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: { type: 'number' },
                                pageSize: { type: 'number' },
                                total: { type: 'number' },
                                totalPages: { type: 'number' }
                            }
                        }
                    }
                },
                message: { type: 'string' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing API key' })
    async findAll(
        @Request() req: any,
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
        @Query('status') status?: 'draft' | 'published' | 'archived',
    ) {
        return this.podcastService.findAllPodcasts(
            page || 1,
            pageSize || 10,
            status,
        );
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get podcast by ID',
        description: 'Retrieve a specific podcast by its ID'
    })
    @ApiParam({ name: 'id', type: Number, description: 'Podcast ID' })
    @ApiResponse({
        status: 200,
        description: 'Podcast retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                error: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        podcastId: { type: 'number' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        audioUrl: { type: 'string' },
                        duration: { type: 'number' },
                        status: { type: 'string' },
                        uploadedBy: { type: 'string' },
                        playCount: { type: 'number' },
                        createdAt: { type: 'string' },
                        updatedAt: { type: 'string' }
                    }
                },
                message: { type: 'string' }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Podcast not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing API key' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.podcastService.findOnePodcast(id);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update podcast',
        description: 'Update podcast information. Only the client that owns the podcast can update it.'
    })
    @ApiParam({ name: 'id', type: Number, description: 'Podcast ID' })
    @ApiBody({ type: UpdatePodcastDto })
    @ApiResponse({
        status: 200,
        description: 'Podcast updated successfully',
        schema: {
            type: 'object',
            properties: {
                error: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        podcastId: { type: 'number' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        status: { type: 'string' },
                        updatedAt: { type: 'string' }
                    }
                },
                message: { type: 'string' }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Podcast not found' })
    @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePodcastDto: UpdatePodcastDto,
    ) {
        return this.podcastService.updatePodcast(id, updatePodcastDto);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete podcast',
        description: 'Delete a podcast. Only the client that owns the podcast can delete it.'
    })
    @ApiParam({ name: 'id', type: Number, description: 'Podcast ID' })
    @ApiResponse({
        status: 200,
        description: 'Podcast deleted successfully',
        schema: {
            type: 'object',
            properties: {
                error: { type: 'boolean' },
                data: { type: 'object' },
                message: { type: 'string' }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Podcast not found' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.podcastService.deletePodcast(id);
    }

    @Post(':id/play')
    @ApiOperation({
        summary: 'Increment play count',
        description: 'Increment the play count of a podcast when it is played'
    })
    @ApiParam({ name: 'id', type: Number, description: 'Podcast ID' })
    @ApiResponse({
        status: 200,
        description: 'Play count incremented successfully',
        schema: {
            type: 'object',
            properties: {
                error: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        podcastId: { type: 'number' },
                        playCount: { type: 'number' }
                    }
                },
                message: { type: 'string' }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Podcast not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing API key' })
    async incrementPlayCount(@Param('id', ParseIntPipe) id: number) {
        return this.podcastService.incrementPlayCount(id);
    }
}
