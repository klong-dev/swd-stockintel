import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockExchange } from './entities/stock-exchange.entity';
import { CreateStockExchangeDto } from './dto/create-stock-exchange.dto';
import { UpdateStockExchangeDto } from './dto/update-stock-exchange.dto';

@Injectable()
export class StockExchangeService {
    constructor(
        @InjectRepository(StockExchange)
        private readonly stockExchangeRepository: Repository<StockExchange>,
    ) { }

    create(createStockExchangeDto: CreateStockExchangeDto) {
        const entity = this.stockExchangeRepository.create(createStockExchangeDto);
        return this.stockExchangeRepository.save(entity);
    }

    findAll() {
        return this.stockExchangeRepository.find();
    }

    findOne(id: number) {
        return this.stockExchangeRepository.findOne({ where: { stockExchangeId: id } });
    }

    async update(id: number, updateStockExchangeDto: UpdateStockExchangeDto) {
        const entity = await this.stockExchangeRepository.findOne({ where: { stockExchangeId: id } });
        if (!entity) throw new NotFoundException('Stock exchange not found');
        await this.stockExchangeRepository.update(id, updateStockExchangeDto);
        return this.findOne(id);
    }

    async remove(id: number) {
        const entity = await this.stockExchangeRepository.findOne({ where: { stockExchangeId: id } });
        if (!entity) throw new NotFoundException('Stock exchange not found');
        return this.stockExchangeRepository.delete(id);
    }
}
