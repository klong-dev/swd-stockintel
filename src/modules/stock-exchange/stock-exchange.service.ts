import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockExchange } from './entities/stock-exchange.entity';
import { CreateStockExchangeDto } from './dto/create-stock-exchange.dto';
import { UpdateStockExchangeDto } from './dto/update-stock-exchange.dto';
import { RedisService } from 'src/modules/redis/redis.service';
import { paginate } from '../../utils/pagination';

@Injectable()
export class StockExchangeService {
    private readonly redis;
    constructor(
        @InjectRepository(StockExchange)
        private readonly stockExchangeRepository: Repository<StockExchange>,
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

    async create(createStockExchangeDto: CreateStockExchangeDto) {
        try {
            const entity = this.stockExchangeRepository.create(createStockExchangeDto);
            const data = await this.stockExchangeRepository.save(entity);
            return {
                error: false,
                data,
                message: 'Stock exchange created successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to create stock exchange',
            };
        }
    }

    async findAll(page: number = 1, pageSize: number = 10): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const data = await this.stockExchangeRepository.find();
            const paginated = paginate(data, page, pageSize);
            return {
                error: false,
                data: paginated,
                message: 'All stock exchanges fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch stock exchanges',
            };
        }
    }

    async findOne(id: number) {
        try {
            const data = await this.stockExchangeRepository.findOne({ where: { stockExchangeId: id } });
            return {
                error: false,
                data,
                message: 'Stock exchange fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch stock exchange',
            };
        }
    }

    async update(id: number, updateStockExchangeDto: UpdateStockExchangeDto) {
        try {
            const entity = await this.stockExchangeRepository.findOne({ where: { stockExchangeId: id } });
            if (!entity) return { error: true, data: null, message: 'Stock exchange not found' };
            await this.stockExchangeRepository.update(id, updateStockExchangeDto);
            const data = await this.stockExchangeRepository.findOne({ where: { stockExchangeId: id } });
            return {
                error: false,
                data,
                message: 'Stock exchange updated successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to update stock exchange',
            };
        }
    }

    async remove(id: number) {
        try {
            const entity = await this.stockExchangeRepository.findOne({ where: { stockExchangeId: id } });
            if (!entity) return { error: true, data: null, message: 'Stock exchange not found' };
            const data = await this.stockExchangeRepository.delete(id);
            return {
                error: false,
                data,
                message: 'Stock exchange deleted successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to delete stock exchange',
            };
        }
    }
}
