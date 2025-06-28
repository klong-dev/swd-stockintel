import Redis from 'ioredis';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    onModuleInit() {
        this.client = new Redis(process.env.REDIS_URL);
    }

    getClient(): Redis {
        return this.client;
    }

    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
        }
    }
}
