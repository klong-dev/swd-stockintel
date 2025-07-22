import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { RedisService } from 'src/modules/redis/redis.service';
import { paginate } from '../../utils/pagination';

@Injectable()
export class StockService {
    private readonly redis;
    private readonly cachePrefix = 'stocks';

    constructor(
        @InjectRepository(Stock)
        private readonly stockRepository: Repository<Stock>,
        private readonly redisService: RedisService,
    ) {
        this.redis = this.redisService.getClient();
    }

    private async getFromCache<T>(key: string): Promise<T | null> {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
    }

    private async setToCache(key: string, value: any, ttl = 60): Promise<void> {
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

    async create(createStockDto: CreateStockDto) {
        try {
            const stock = this.stockRepository.create(createStockDto);
            const data = await this.stockRepository.save(stock);

            // Clear all related cache keys
            await this.clearCachePattern(`${this.cachePrefix}:*`);

            return {
                error: false,
                data,
                message: 'Stock created successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to create stock',
            };
        }
    }

    async findAll(page: number = 1, pageSize: number = 10): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const data = await this.stockRepository.find();
            const paginated = paginate(data, page, pageSize);
            return {
                error: false,
                data: paginated,
                message: 'All stocks fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch stocks',
            };
        }
    }

    async findOne(id: number) {
        try {
            const data = await this.stockRepository.findOne({ where: { stockId: id } });
            return {
                error: false,
                data,
                message: 'Stock fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch stock',
            };
        }
    }

    async update(id: number, updateStockDto: UpdateStockDto) {
        try {
            const stock = await this.stockRepository.findOne({ where: { stockId: id } });
            if (!stock) return { error: true, data: null, message: 'Stock not found' };
            await this.stockRepository.update(id, updateStockDto);
            const data = await this.stockRepository.findOne({ where: { stockId: id } });
            return {
                error: false,
                data,
                message: 'Stock updated successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to update stock',
            };
        }
    }

    async remove(id: number) {
        try {
            const stock = await this.stockRepository.findOne({ where: { stockId: id } });
            if (!stock) return { error: true, data: null, message: 'Stock not found' };
            const data = await this.stockRepository.delete(id);
            return {
                error: false,
                data,
                message: 'Stock deleted successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to delete stock',
            };
        }
    }
}
