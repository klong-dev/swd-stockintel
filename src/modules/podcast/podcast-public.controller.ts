import {
    Controller,
    Get,
    Param,
    Query,
    ParseIntPipe,
    Post,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiParam,
} from '@nestjs/swagger';
import { PodcastService } from './podcast.service';

@ApiTags('Public Podcasts')
@Controller('public/podcasts')
export class PodcastPublicController {
    constructor(private readonly podcastService: PodcastService) { }

    @Get()
    @ApiOperation({
        summary: 'Get published podcasts (public)',
        description: 'Retrieve all published podcasts without authentication. Supports pagination and filtering.'
    })
    @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'pageSize', type: Number, required: false, description: 'Items per page (default: 10)' })
    @ApiQuery({ name: 'featured', type: Boolean, required: false, description: 'Filter by featured status' })
    @ApiQuery({ name: 'tags', type: String, required: false, description: 'Comma-separated list of tags to filter by' })
    @ApiResponse({
        status: 200,
        description: 'Published podcasts retrieved successfully',
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
                                    fileSize: { type: 'number' },
                                    fileFormat: { type: 'string' },
                                    status: { type: 'string', enum: ['published'] },
                                    playCount: { type: 'number' },
                                    isFeatured: { type: 'boolean' },
                                    tags: { type: 'array', items: { type: 'string' } },
                                    uploadedBy: { type: 'string' },
                                    createdAt: { type: 'string' },
                                    updatedAt: { type: 'string' },
                                    client: {
                                        type: 'object',
                                        properties: {
                                            clientId: { type: 'number' },
                                            clientName: { type: 'string' }
                                        }
                                    }
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
    async getPublishedPodcasts(
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
        @Query('featured') featured?: boolean,
        @Query('tags') tags?: string,
    ) {
        const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : undefined;
        return this.podcastService.findPublishedPodcasts(
            page || 1,
            pageSize || 10,
            featured,
            tagArray
        );
    }

    @Get('featured')
    @ApiOperation({
        summary: 'Get featured podcasts (public)',
        description: 'Retrieve featured published podcasts without authentication.'
    })
    @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'pageSize', type: Number, required: false, description: 'Items per page (default: 10)' })
    @ApiResponse({
        status: 200,
        description: 'Featured podcasts retrieved successfully'
    })
    async getFeaturedPodcasts(
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        return this.podcastService.findPublishedPodcasts(
            page || 1,
            pageSize || 10,
            true // featured = true
        );
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get podcast by ID (public)',
        description: 'Retrieve a specific published podcast by its ID without authentication'
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
                        fileSize: { type: 'number' },
                        fileFormat: { type: 'string' },
                        status: { type: 'string' },
                        playCount: { type: 'number' },
                        isFeatured: { type: 'boolean' },
                        tags: { type: 'array', items: { type: 'string' } },
                        uploadedBy: { type: 'string' },
                        createdAt: { type: 'string' },
                        updatedAt: { type: 'string' },
                        client: {
                            type: 'object',
                            properties: {
                                clientId: { type: 'number' },
                                clientName: { type: 'string' }
                            }
                        }
                    }
                },
                message: { type: 'string' }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Podcast not found' })
    async getPublishedPodcast(@Param('id', ParseIntPipe) id: number) {
        return this.podcastService.findPublishedPodcastById(id);
    }

    @Post(':id/play')
    @ApiOperation({
        summary: 'Increment play count (public)',
        description: 'Increment the play count of a published podcast when it is played'
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
    async incrementPlayCount(@Param('id', ParseIntPipe) id: number) {
        return this.podcastService.incrementPlayCountPublic(id);
    }
}
