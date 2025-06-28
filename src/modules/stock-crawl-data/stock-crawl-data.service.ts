import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockCrawlData } from './entities/stock-crawl-data.entity';
import { CreateStockCrawlDataDto } from './dto/create-stock-crawl-data.dto';
import { UpdateStockCrawlDataDto } from './dto/update-stock-crawl-data.dto';

@Injectable()
export class StockCrawlDataService {
    constructor(
        @InjectRepository(StockCrawlData)
        private readonly stockCrawlDataRepository: Repository<StockCrawlData>,
    ) { }

    async create(createStockCrawlDataDto: CreateStockCrawlDataDto) {
        try {
            const entity = this.stockCrawlDataRepository.create(createStockCrawlDataDto);
            const data = await this.stockCrawlDataRepository.save(entity);
            return {
                error: false,
                data,
                message: 'Stock crawl data created successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to create stock crawl data',
            };
        }
    }

    async findAll() {
        try {
            const data = await this.stockCrawlDataRepository.find();
            return {
                error: false,
                data,
                message: 'All stock crawl data fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch stock crawl data',
            };
        }
    }

    async findOne(id: number) {
        try {
            const data = await this.stockCrawlDataRepository.findOne({ where: { crawlId: id } });
            return {
                error: false,
                data,
                message: 'Stock crawl data fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch stock crawl data',
            };
        }
    }

    async update(id: number, updateStockCrawlDataDto: UpdateStockCrawlDataDto) {
        try {
            const entity = await this.stockCrawlDataRepository.findOne({ where: { crawlId: id } });
            if (!entity) return { error: true, data: null, message: 'Stock crawl data not found' };
            await this.stockCrawlDataRepository.update(id, updateStockCrawlDataDto);
            const data = await this.stockCrawlDataRepository.findOne({ where: { crawlId: id } });
            return {
                error: false,
                data,
                message: 'Stock crawl data updated successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to update stock crawl data',
            };
        }
    }

    async remove(id: number) {
        try {
            const entity = await this.stockCrawlDataRepository.findOne({ where: { crawlId: id } });
            if (!entity) return { error: true, data: null, message: 'Stock crawl data not found' };
            const data = await this.stockCrawlDataRepository.delete(id);
            return {
                error: false,
                data,
                message: 'Stock crawl data deleted successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to delete stock crawl data',
            };
        }
    }
}
