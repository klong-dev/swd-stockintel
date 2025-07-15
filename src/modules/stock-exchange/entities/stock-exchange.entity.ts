import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Stock } from '../../stock/entities/stock.entity';

@Entity('stock_exchange')
export class StockExchange {
    @PrimaryGeneratedColumn({ name: 'stock_exchange_id' })
    stockExchangeId: number;

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name: string;

    @OneToMany(() => Stock, stock => stock.stockExchange)
    stocks: Stock[];
}