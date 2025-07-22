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
    ParseIntPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiParam,
    ApiBearerAuth,
    ApiBody
} from '@nestjs/swagger';
import { PodcastService } from './podcast.service';
import { CreatePodcastClientDto } from './dto/create-podcast-client.dto';
import { UpdatePodcastClientDto } from './dto/update-podcast-client.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('Admin - Podcast Clients')
@ApiBearerAuth()
@Controller('admin/podcast-clients')
@UseGuards(JwtAuthGuard)
export class PodcastAdminController {
    constructor(private readonly podcastService: PodcastService) { }

    @Post()
    @ApiOperation({
        summary: 'Create podcast client',
        description: 'Create a new podcast client with API keys. Admin access required.'
    })
    @ApiBody({ type: CreatePodcastClientDto })
    @ApiResponse({
        status: 201,
        description: 'Podcast client created successfully',
        schema: {
            type: 'object',
            properties: {
                error: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        clientId: { type: 'number' },
                        clientName: { type: 'string' },
                        apiKey: { type: 'string', description: 'Public API key (pk_*)' },
                        secretKey: { type: 'string', description: 'Secret API key (sk_*)' },
                        isActive: { type: 'boolean' },
                        maxStorageMb: { type: 'number' },
                        maxFileSizeMb: { type: 'number' },
                        allowedFormats: { type: 'array', items: { type: 'string' } },
                        rateLimitPerHour: { type: 'number' },
                        contactEmail: { type: 'string' },
                        description: { type: 'string' }
                    }
                },
                message: { type: 'string' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized - admin access required' })
    async createClient(@Body() createPodcastClientDto: CreatePodcastClientDto) {
        return this.podcastService.createPodcastClient(createPodcastClientDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all podcast clients',
        description: 'Retrieve paginated list of all podcast clients. Admin access required.'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Items per page (default: 10)' })
    @ApiResponse({
        status: 200,
        description: 'Podcast clients retrieved successfully',
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
                                    clientId: { type: 'number' },
                                    clientName: { type: 'string' },
                                    isActive: { type: 'boolean' },
                                    rateLimitPerHour: { type: 'number' },
                                    contactEmail: { type: 'string' },
                                    lastAccess: { type: 'string' },
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
    @ApiResponse({ status: 401, description: 'Unauthorized - admin access required' })
    async findAllClients(
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        return this.podcastService.getAllClients(page || 1, pageSize || 10);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update podcast client',
        description: 'Update podcast client information. Admin access required.'
    })
    @ApiParam({ name: 'id', type: Number, description: 'Client ID' })
    @ApiBody({ type: UpdatePodcastClientDto })
    @ApiResponse({
        status: 200,
        description: 'Podcast client updated successfully',
        schema: {
            type: 'object',
            properties: {
                error: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        clientId: { type: 'number' },
                        clientName: { type: 'string' },
                        isActive: { type: 'boolean' },
                        maxStorageMb: { type: 'number' },
                        maxFileSizeMb: { type: 'number' },
                        rateLimitPerHour: { type: 'number' },
                        updatedAt: { type: 'string' }
                    }
                },
                message: { type: 'string' }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Client not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized - admin access required' })
    async updateClient(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePodcastClientDto: UpdatePodcastClientDto,
    ) {
        return this.podcastService.updatePodcastClient(id, updatePodcastClientDto);
    }

    @Post(':id/regenerate-keys')
    @ApiOperation({
        summary: 'Regenerate client API keys',
        description: 'Generate new API keys for a podcast client. Old keys will become invalid. Admin access required.'
    })
    @ApiParam({ name: 'id', type: Number, description: 'Client ID' })
    @ApiResponse({
        status: 200,
        description: 'API keys regenerated successfully',
        schema: {
            type: 'object',
            properties: {
                error: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        clientId: { type: 'number' },
                        clientName: { type: 'string' },
                        apiKey: { type: 'string', description: 'New public API key (pk_*)' },
                        secretKey: { type: 'string', description: 'New secret API key (sk_*)' },
                        updatedAt: { type: 'string' }
                    }
                },
                message: { type: 'string' }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Client not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized - admin access required' })
    async regenerateKeys(@Param('id', ParseIntPipe) id: number) {
        return this.podcastService.regenerateClientKeys(id);
    }

    @Get('all-podcasts')
    @ApiOperation({
        summary: 'Get all podcasts (Admin view)',
        description: 'Retrieve paginated list of all podcasts across all clients. Admin access required.'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Items per page (default: 10)' })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: ['draft', 'published', 'archived'],
        description: 'Filter by status'
    })
    @ApiQuery({ name: 'clientId', required: false, type: Number, description: 'Filter by client ID' })
    @ApiResponse({
        status: 200,
        description: 'All podcasts retrieved successfully',
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
                                    status: { type: 'string' },
                                    uploadedBy: { type: 'string' },
                                    playCount: { type: 'number' },
                                    clientId: { type: 'number' },
                                    clientName: { type: 'string' },
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
    @ApiResponse({ status: 401, description: 'Unauthorized - admin access required' })
    async findAllPodcasts(
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
        @Query('status') status?: 'draft' | 'published' | 'archived',
        @Query('clientId') clientId?: number,
    ) {
        return this.podcastService.findAllPodcasts(
            page || 1,
            pageSize || 10,
            status,
        );
    }
}
