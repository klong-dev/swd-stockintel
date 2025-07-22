import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PodcastClient } from '../entities/podcast-client.entity';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class PodcastAuthGuard implements CanActivate {
    private readonly redis;

    constructor(
        @InjectRepository(PodcastClient)
        private readonly podcastClientRepository: Repository<PodcastClient>,
        private readonly redisService: RedisService,
    ) {
        this.redis = this.redisService.getClient();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // Only check for secretKey in request body
        const secretKey = request.body?.secretKey;

        if (!secretKey) {
            throw new UnauthorizedException('Missing secretKey in request body');
        }

        try {
            // Try to get client from cache first
            const cacheKey = `podcast_client:${secretKey}`;
            let client = await this.getFromCache<PodcastClient>(cacheKey);

            if (!client) {
                // If not in cache, fetch from database
                client = await this.podcastClientRepository.findOne({
                    where: { secretKey, isActive: true }
                });

                if (!client) {
                    throw new UnauthorizedException('Invalid secretKey');
                }

                // Cache for 5 minutes
                await this.setToCache(cacheKey, client, 300);
            }

            // Check rate limiting
            const rateLimitKey = `rate_limit:${client.clientId}:${new Date().getHours()}`;
            const currentRequests = await this.redis.get(rateLimitKey) || '0';

            if (parseInt(currentRequests) >= client.rateLimitPerHour) {
                throw new UnauthorizedException('Rate limit exceeded');
            }

            // Increment rate limit counter
            await this.redis.incr(rateLimitKey);
            await this.redis.expire(rateLimitKey, 3600); // 1 hour

            // Update last access
            await this.podcastClientRepository.update(client.clientId, {
                lastAccess: new Date()
            });

            // Attach client to request
            request.podcastClient = client;

            return true;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Authentication failed');
        }
    }

    private async getFromCache<T>(key: string): Promise<T | null> {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
    }

    private async setToCache(key: string, value: any, ttl = 60): Promise<void> {
        await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    }
}
