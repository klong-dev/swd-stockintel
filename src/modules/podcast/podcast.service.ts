import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Podcast } from './entities/podcast.entity';
import { PodcastClient } from './entities/podcast-client.entity';
import { CreatePodcastDto } from './dto/create-podcast.dto';
import { UploadPodcastDto } from './dto/upload-podcast.dto';
import { UpdatePodcastDto } from './dto/update-podcast.dto';
import { CreatePodcastClientDto } from './dto/create-podcast-client.dto';
import { UpdatePodcastClientDto } from './dto/update-podcast-client.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RedisService } from '../redis/redis.service';
import { paginate } from '../../utils/pagination';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class PodcastService {
    private readonly redis;
    private readonly cachePrefix = 'podcasts';

    constructor(
        @InjectRepository(Podcast)
        private readonly podcastRepository: Repository<Podcast>,
        @InjectRepository(PodcastClient)
        private readonly podcastClientRepository: Repository<PodcastClient>,
        private readonly cloudinaryService: CloudinaryService,
        private readonly redisService: RedisService,
    ) {
        this.redis = this.redisService.getClient();
    }

    // Cache helper methods
    private async getFromCache<T>(key: string): Promise<T | null> {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
    }

    private async setToCache(key: string, value: any, ttl = 300): Promise<void> {
        await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    }

    private async removeFromCache(key: string): Promise<void> {
        await this.redis.del(key);
    }

    private async clearCachePattern(pattern: string): Promise<void> {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }

    // Podcast Client Management
    async createPodcastClient(createClientDto: CreatePodcastClientDto) {
        try {
            const secretKey = this.generateSecretKey();
            const apiKey = this.generateApiKey();

            const client = this.podcastClientRepository.create({
                ...createClientDto,
                secretKey,
                apiKey,
            });

            const savedClient = await this.podcastClientRepository.save(client);

            // Clear all related cache keys
            await this.clearCachePattern(`${this.cachePrefix}:*`);
            await this.clearCachePattern(`podcast_client:*`);

            return {
                error: false,
                data: {
                    clientId: savedClient.clientId,
                    clientName: savedClient.clientName,
                    secretKey: savedClient.secretKey,
                    apiKey: savedClient.apiKey,
                    maxStorageMb: savedClient.maxStorageMb,
                    maxFileSizeMb: savedClient.maxFileSizeMb,
                    allowedFormats: savedClient.allowedFormats,
                    rateLimitPerHour: savedClient.rateLimitPerHour,
                },
                message: 'Podcast client created successfully',
            };
        } catch (error) {
            return {
                error: true,
                data: null,
                message: error.message || 'Failed to create podcast client',
            };
        }
    }

    async updatePodcastClient(clientId: number, updateClientDto: UpdatePodcastClientDto) {
        try {
            const client = await this.podcastClientRepository.findOne({
                where: { clientId }
            });

            if (!client) {
                return {
                    error: true,
                    data: null,
                    message: 'Podcast client not found',
                };
            }

            await this.podcastClientRepository.update(clientId, updateClientDto);

            // Clear cache
            await this.clearCachePattern(`podcast_client:*`);

            const updatedClient = await this.podcastClientRepository.findOne({
                where: { clientId }
            });

            return {
                error: false,
                data: updatedClient,
                message: 'Podcast client updated successfully',
            };
        } catch (error) {
            return {
                error: true,
                data: null,
                message: error.message || 'Failed to update podcast client',
            };
        }
    }

    async regenerateClientKeys(clientId: number) {
        try {
            const client = await this.podcastClientRepository.findOne({
                where: { clientId }
            });

            if (!client) {
                return {
                    error: true,
                    data: null,
                    message: 'Podcast client not found',
                };
            }

            const newSecretKey = this.generateSecretKey();
            const newApiKey = this.generateApiKey();

            await this.podcastClientRepository.update(clientId, {
                secretKey: newSecretKey,
                apiKey: newApiKey,
            });

            // Clear all cache for this client
            await this.clearCachePattern(`podcast_client:*`);

            return {
                error: false,
                data: {
                    secretKey: newSecretKey,
                    apiKey: newApiKey,
                },
                message: 'Client keys regenerated successfully',
            };
        } catch (error) {
            return {
                error: true,
                data: null,
                message: error.message || 'Failed to regenerate client keys',
            };
        }
    }

    async getAllClients(page: number = 1, pageSize: number = 10) {
        try {
            const clients = await this.podcastClientRepository.find({
                relations: ['podcasts'],
                order: { createdAt: 'DESC' }
            });

            const sanitizedClients = clients.map(client => ({
                ...client,
                secretKey: `${client.secretKey.substring(0, 8)}...`,
                apiKey: `${client.apiKey.substring(0, 8)}...`,
            }));

            const paginated = paginate(sanitizedClients, page, pageSize);

            return {
                error: false,
                data: paginated,
                message: 'Podcast clients fetched successfully',
            };
        } catch (error) {
            return {
                error: true,
                data: null,
                message: error.message || 'Failed to fetch podcast clients',
            };
        }
    }

    // Podcast Management
    async uploadPodcast(
        audioFile: any, // Using any to avoid Express.Multer.File type issues
        uploadPodcastDto: UploadPodcastDto,
        podcastClient?: PodcastClient, // Make optional since we'll validate internally
        uploadedBy?: string
    ) {
        try {
            // Extract podcast data from upload DTO (exclude secretKey)
            const { secretKey, ...createPodcastDto } = uploadPodcastDto;

            // If no podcastClient provided, validate using secretKey
            let validatedClient = podcastClient;
            if (!validatedClient) {
                if (!secretKey) {
                    return {
                        error: true,
                        data: null,
                        message: 'secretKey is required',
                    };
                }

                validatedClient = await this.podcastClientRepository.findOne({
                    where: { secretKey, isActive: true }
                });

                if (!validatedClient) {
                    return {
                        error: true,
                        data: null,
                        message: 'Invalid secretKey',
                    };
                }
            }

            // Set uploadedBy if not provided
            const finalUploadedBy = uploadedBy || createPodcastDto.uploadedBy || validatedClient.clientName || 'anonymous';

            // Validate file
            const validation = this.validateAudioFile(audioFile, validatedClient);
            if (!validation.isValid) {
                return {
                    error: true,
                    data: null,
                    message: validation.message,
                };
            }

            // Check storage limit
            const fileSizeMb = Math.ceil(audioFile.size / (1024 * 1024)); // Round up to ensure we don't exceed limits
            if (validatedClient.usedStorageMb + fileSizeMb > validatedClient.maxStorageMb) {
                return {
                    error: true,
                    data: null,
                    message: 'Storage limit exceeded',
                };
            }

            // Upload to Cloudinary
            const audioUrl = await this.cloudinaryService.uploadAudioFromBuffer(
                audioFile.buffer,
                'podcasts/audio'
            );

            // Create podcast record
            const podcast = this.podcastRepository.create({
                ...createPodcastDto,
                audioUrl,
                fileSize: audioFile.size,
                fileFormat: path.extname(audioFile.originalname).substring(1).toLowerCase(),
                clientId: validatedClient.clientId,
                uploadedBy: finalUploadedBy,
            });

            const savedPodcast = await this.podcastRepository.save(podcast);

            // Update client storage usage
            await this.podcastClientRepository.update(validatedClient.clientId, {
                usedStorageMb: validatedClient.usedStorageMb + fileSizeMb,
            });

            // Clear caches
            await this.clearCachePattern(`${this.cachePrefix}:*`);

            return {
                error: false,
                data: savedPodcast,
                message: 'Podcast uploaded successfully',
            };
        } catch (error) {
            return {
                error: true,
                data: null,
                message: error.message || 'Failed to upload podcast',
            };
        }
    }

    async findAllPodcasts(
        page: number = 1,
        pageSize: number = 10,
        status?: 'draft' | 'published' | 'archived',
    ) {
        try {
            const cacheKey = `${this.cachePrefix}:all:${page}:${pageSize}:${status}}`;
            const cached = await this.getFromCache(cacheKey);
            if (cached) {
                return {
                    error: false,
                    data: cached,
                    message: 'Podcasts fetched from cache',
                };
            }

            const queryBuilder = this.podcastRepository.createQueryBuilder('podcast')
                .leftJoinAndSelect('podcast.client', 'client')
                .leftJoinAndSelect('podcast.uploader', 'uploader')
                .orderBy('podcast.createdAt', 'DESC');

            if (status) {
                queryBuilder.andWhere('podcast.status = :status', { status });
            }

            const podcasts = await queryBuilder.getMany();
            const paginated = paginate(podcasts, page, pageSize);

            await this.setToCache(cacheKey, paginated);

            return {
                error: false,
                data: paginated,
                message: 'Podcasts fetched successfully',
            };
        } catch (error) {
            return {
                error: true,
                data: null,
                message: error.message || 'Failed to fetch podcasts',
            };
        }
    }

    // Public method for fetching published podcasts (no auth required)
    async findPublishedPodcasts(
        page: number = 1,
        pageSize: number = 10,
        featured?: boolean,
        tags?: string[]
    ) {
        try {
            const cacheKey = `${this.cachePrefix}:public:${page}:${pageSize}:${featured}:${tags?.join(',')}`;
            const cached = await this.getFromCache(cacheKey);
            if (cached) {
                return {
                    error: false,
                    data: cached,
                    message: 'Published podcasts fetched from cache',
                };
            }

            const queryBuilder = this.podcastRepository.createQueryBuilder('podcast')
                .leftJoinAndSelect('podcast.client', 'client')
                .where('podcast.status = :status', { status: 'published' })
                .orderBy('podcast.createdAt', 'DESC');

            if (featured !== undefined) {
                queryBuilder.andWhere('podcast.isFeatured = :featured', { featured });
            }

            if (tags && tags.length > 0) {
                // Simple tag search - in a production app, you might want more sophisticated tag matching
                const tagConditions = tags.map((tag, index) => `JSON_CONTAINS(podcast.tags, '"${tag}"')`).join(' OR ');
                queryBuilder.andWhere(`(${tagConditions})`);
            }

            const podcasts = await queryBuilder.getMany();

            // Remove sensitive client information for public display
            const sanitizedPodcasts = podcasts.map(podcast => ({
                ...podcast,
                client: {
                    clientId: podcast.client.clientId,
                    clientName: podcast.client.clientName,
                    // Remove sensitive fields like secretKey, apiKey, etc.
                }
            }));

            const paginated = paginate(sanitizedPodcasts, page, pageSize);

            await this.setToCache(cacheKey, paginated, 600); // Cache for 10 minutes

            return {
                error: false,
                data: paginated,
                message: 'Published podcasts fetched successfully',
            };
        } catch (error) {
            return {
                error: true,
                data: null,
                message: error.message || 'Failed to fetch published podcasts',
            };
        }
    }

    // Public method for fetching a single published podcast by ID (no auth required)
    async findPublishedPodcastById(id: number) {
        try {
            const cacheKey = `${this.cachePrefix}:public:${id}`;
            const cached = await this.getFromCache<Podcast>(cacheKey);
            if (cached) {
                return {
                    error: false,
                    data: cached,
                    message: 'Published podcast fetched from cache',
                };
            }

            const podcast = await this.podcastRepository.findOne({
                where: {
                    podcastId: id,
                    status: 'published'
                },
                relations: ['client']
            });

            if (!podcast) {
                return {
                    error: true,
                    data: null,
                    message: 'Published podcast not found',
                };
            }

            // Remove sensitive client information for public display
            const sanitizedPodcast = {
                ...podcast,
                client: {
                    clientId: podcast.client.clientId,
                    clientName: podcast.client.clientName,
                    // Remove sensitive fields like secretKey, apiKey, etc.
                }
            };

            await this.setToCache(cacheKey, sanitizedPodcast, 600); // Cache for 10 minutes

            return {
                error: false,
                data: sanitizedPodcast,
                message: 'Published podcast fetched successfully',
            };
        } catch (error) {
            return {
                error: true,
                data: null,
                message: error.message || 'Failed to fetch published podcast',
            };
        }
    }

    async findOnePodcast(id: number) {
        try {
            const cacheKey = `${this.cachePrefix}:${id}`;
            const cached = await this.getFromCache<Podcast>(cacheKey);
            if (cached) {
                return {
                    error: false,
                    data: cached,
                    message: 'Podcast fetched from cache',
                };
            }

            const podcast = await this.podcastRepository.findOne({
                where: { podcastId: id },
                relations: ['client', 'uploader']
            });

            if (!podcast) {
                return {
                    error: true,
                    data: null,
                    message: 'Podcast not found',
                };
            }

            await this.setToCache(cacheKey, podcast);

            return {
                error: false,
                data: podcast,
                message: 'Podcast fetched successfully',
            };
        } catch (error) {
            return {
                error: true,
                data: null,
                message: error.message || 'Failed to fetch podcast',
            };
        }
    }

    async updatePodcast(id: number, updatePodcastDto: UpdatePodcastDto) {
        try {
            const podcast = await this.podcastRepository.findOne({
                where: { podcastId: id }
            });

            if (!podcast) {
                return {
                    error: true,
                    data: null,
                    message: 'Podcast not found',
                };
            }

            await this.podcastRepository.update(id, updatePodcastDto);

            // Clear caches
            await this.clearCachePattern(`${this.cachePrefix}:*`);

            const updatedPodcast = await this.podcastRepository.findOne({
                where: { podcastId: id },
                relations: ['client', 'uploader']
            });

            return {
                error: false,
                data: updatedPodcast,
                message: 'Podcast updated successfully',
            };
        } catch (error) {
            return {
                error: true,
                data: null,
                message: error.message || 'Failed to update podcast',
            };
        }
    }

    async deletePodcast(id: number) {
        try {
            const podcast = await this.podcastRepository.findOne({
                where: { podcastId: id }
            });

            if (!podcast) {
                return {
                    error: true,
                    data: null,
                    message: 'Podcast not found',
                };
            }

            // Delete from Cloudinary
            const publicId = this.extractPublicIdFromUrl(podcast.audioUrl);
            if (publicId) {
                await this.cloudinaryService.deleteFile(publicId, 'video');
            }

            // Get the client to update storage
            const podcastClient = await this.podcastClientRepository.findOne({
                where: { clientId: podcast.clientId }
            });

            if (podcastClient) {
                // Update client storage usage
                const fileSizeMb = Math.ceil(podcast.fileSize / (1024 * 1024)); // Round up to match upload calculation
                await this.podcastClientRepository.update(podcast.clientId, {
                    usedStorageMb: Math.max(0, podcastClient.usedStorageMb - fileSizeMb),
                });
            }

            await this.podcastRepository.delete(id);

            // Clear caches
            await this.clearCachePattern(`${this.cachePrefix}:*`);

            return {
                error: false,
                data: null,
                message: 'Podcast deleted successfully',
            };
        } catch (error) {
            return {
                error: true,
                data: null,
                message: error.message || 'Failed to delete podcast',
            };
        }
    }

    async incrementPlayCount(id: number) {
        try {
            await this.podcastRepository.increment({ podcastId: id }, 'playCount', 1);

            // Clear specific cache
            await this.removeFromCache(`${this.cachePrefix}:${id}`);

            return {
                error: false,
                data: null,
                message: 'Play count incremented',
            };
        } catch (error) {
            return {
                error: true,
                data: null,
                message: error.message || 'Failed to increment play count',
            };
        }
    }

    // Public method for incrementing play count (no auth required, only for published podcasts)
    async incrementPlayCountPublic(id: number) {
        try {
            // First check if the podcast exists and is published
            const podcast = await this.podcastRepository.findOne({
                where: {
                    podcastId: id,
                    status: 'published'
                }
            });

            if (!podcast) {
                return {
                    error: true,
                    data: null,
                    message: 'Published podcast not found',
                };
            }

            await this.podcastRepository.increment({ podcastId: id }, 'playCount', 1);

            // Get updated play count
            const updatedPodcast = await this.podcastRepository.findOne({
                where: { podcastId: id },
                select: ['podcastId', 'playCount']
            });

            // Clear specific cache
            await this.removeFromCache(`${this.cachePrefix}:${id}`);
            await this.removeFromCache(`${this.cachePrefix}:public:${id}`);
            // Clear public podcast lists cache
            await this.clearCachePattern(`${this.cachePrefix}:public:*`);

            return {
                error: false,
                data: {
                    podcastId: updatedPodcast.podcastId,
                    playCount: updatedPodcast.playCount
                },
                message: 'Play count incremented',
            };
        } catch (error) {
            return {
                error: true,
                data: null,
                message: error.message || 'Failed to increment play count',
            };
        }
    }

    // Helper methods
    private generateSecretKey(): string {
        return `sk_${crypto.randomBytes(32).toString('hex')}`;
    }

    private generateApiKey(): string {
        return `pk_${crypto.randomBytes(24).toString('hex')}`;
    }

    private validateAudioFile(file: any, client: PodcastClient) {
        const fileSizeMb = Math.ceil(file.size / (1024 * 1024)); // Round up to ensure consistent validation
        const fileExtension = path.extname(file.originalname).substring(1).toLowerCase();

        if (fileSizeMb > client.maxFileSizeMb) {
            return {
                isValid: false,
                message: `File size exceeds maximum allowed size of ${client.maxFileSizeMb}MB`,
            };
        }

        if (!client.allowedFormats.includes(fileExtension)) {
            return {
                isValid: false,
                message: `File format not allowed. Allowed formats: ${client.allowedFormats.join(', ')}`,
            };
        }

        return { isValid: true, message: 'File is valid' };
    }

    private extractPublicIdFromUrl(url: string): string | null {
        try {
            const urlParts = url.split('/');
            const fileNameWithExtension = urlParts[urlParts.length - 1];
            const fileName = fileNameWithExtension.split('.')[0];
            const folderPath = urlParts.slice(-3, -1).join('/');
            return `${folderPath}/${fileName}`;
        } catch {
            return null;
        }
    }
}
