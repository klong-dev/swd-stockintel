import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { StockExchange } from '../../stock-exchange/entities/stock-exchange.entity';
import { StockCrawlData } from '../../stock-crawl-data/entities/stock-crawl-data.entity';
import { Post } from '../../post/entities/post.entity';

@Entity('stock')
export class Stock {
    @PrimaryGeneratedColumn({ name: 'stock_id' })
    stockId: number;

    @Column({ name: 'symbol', type: 'varchar', length: 10 })
    symbol: string;

    @Column({ name: 'company_name', type: 'varchar', length: 100 })
    companyName: string;

    @Column({ name: 'stock_exchange_id', type: 'int', nullable: true })
    stockExchangeId: number | null;

    @ManyToOne(() => StockExchange, stockExchange => stockExchange.stocks)
    @JoinColumn({ name: 'stock_exchange_id' })
    stockExchange: StockExchange;

    @OneToMany(() => StockCrawlData, crawlData => crawlData.stock)
    crawlData: StockCrawlData[];

    @OneToMany(() => Post, post => post.stock)
    posts: Post[];
}