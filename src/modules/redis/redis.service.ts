import Redis from 'ioredis';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    onModuleInit() {
        this.client = new Redis(process.env.REDIS_URL);
    }

    getClient(): Redis {
        if (!this.client) {
            this.client = new Redis(process.env.REDIS_URL);
        }
        return this.client;
    }

    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
        }
    }
}
