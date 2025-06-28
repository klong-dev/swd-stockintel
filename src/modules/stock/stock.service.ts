import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class StockService {
    constructor(
        @InjectRepository(Stock)
        private readonly stockRepository: Repository<Stock>,
    ) { }

    async create(createStockDto: CreateStockDto) {
        try {
            const stock = this.stockRepository.create(createStockDto);
            const data = await this.stockRepository.save(stock);
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

    async findAll() {
        try {
            const data = await this.stockRepository.find();
            return {
                error: false,
                data,
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
