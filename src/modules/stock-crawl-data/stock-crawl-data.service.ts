import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockCrawlData } from './entities/stock-crawl-data.entity';
import { CreateStockCrawlDataDto } from './dto/create-stock-crawl-data.dto';
import { UpdateStockCrawlDataDto } from './dto/update-stock-crawl-data.dto';
import { RedisService } from 'src/modules/redis/redis.service';

@Injectable()
export class StockCrawlDataService {
    private readonly redis;
    constructor(
        @InjectRepository(StockCrawlData)
        private readonly stockCrawlDataRepository: Repository<StockCrawlData>,
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

    create(createStockCrawlDataDto: CreateStockCrawlDataDto) {
        const entity = this.stockCrawlDataRepository.create(createStockCrawlDataDto);
        return this.stockCrawlDataRepository.save(entity);
    }

    findAll() {
        return this.stockCrawlDataRepository.find();
    }

    findOne(id: number) {
        return this.stockCrawlDataRepository.findOne({ where: { crawlId: id } });
    }

    async update(id: number, updateStockCrawlDataDto: UpdateStockCrawlDataDto) {
        const entity = await this.stockCrawlDataRepository.findOne({ where: { crawlId: id } });
        if (!entity) throw new NotFoundException('Stock crawl data not found');
        await this.stockCrawlDataRepository.update(id, updateStockCrawlDataDto);
        return this.findOne(id);
    }

    async remove(id: number) {
        const entity = await this.stockCrawlDataRepository.findOne({ where: { crawlId: id } });
        if (!entity) throw new NotFoundException('Stock crawl data not found');
        return this.stockCrawlDataRepository.delete(id);
    }
}
