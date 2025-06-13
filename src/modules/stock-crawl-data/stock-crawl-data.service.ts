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
