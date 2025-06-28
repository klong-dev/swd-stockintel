import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { RedisService } from 'src/modules/redis/redis.service';

@Injectable()
export class StockService {
    private readonly redis;
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

    create(createStockDto: CreateStockDto) {
        const stock = this.stockRepository.create(createStockDto);
        return this.stockRepository.save(stock);
    }

    findAll() {
        return this.stockRepository.find();
    }

    findOne(id: number) {
        return this.stockRepository.findOne({ where: { stockId: id } });
    }

    async update(id: number, updateStockDto: UpdateStockDto) {
        const stock = await this.stockRepository.findOne({ where: { stockId: id } });
        if (!stock) throw new NotFoundException('Stock not found');
        await this.stockRepository.update(id, updateStockDto);
        return this.findOne(id);
    }

    async remove(id: number) {
        const stock = await this.stockRepository.findOne({ where: { stockId: id } });
        if (!stock) throw new NotFoundException('Stock not found');
        return this.stockRepository.delete(id);
    }
}
