import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Stock } from '../../stock/entities/stock.entity';

@Entity('stock_crawl_data')
export class StockCrawlData {
    @PrimaryGeneratedColumn({ name: 'crawl_id' })
    crawlId: number;

    @Column({ name: 'stock_id', type: 'int' })
    stockId: number;

    @Column({ name: 'crawl_date', type: 'date' })
    crawlDate: Date;

    @Column({ type: 'bigint', nullable: true })
    volume: number | null;

    @Column({ name: 'ref_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
    refPrice: number | null;

    @Column({ name: 'ceil_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
    ceilPrice: number | null;

    @Column({ name: 'floor_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
    floorPrice: number | null;

    @Column({ name: 'open_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
    openPrice: number | null;

    @Column({ name: 'high_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
    highPrice: number | null;

    @Column({ name: 'low_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
    lowPrice: number | null;

    @Column({ name: 'foreign_buy_volume', type: 'bigint', nullable: true })
    foreignBuyVolume: number | null;

    @Column({ name: 'foreign_sell_volume', type: 'bigint', nullable: true })
    foreignSellVolume: number | null;

    @Column({ name: 'foreign_buy_value', type: 'decimal', precision: 15, scale: 2, nullable: true })
    foreignBuyValue: number | null;

    @Column({ name: 'foreign_sell_value', type: 'decimal', precision: 15, scale: 2, nullable: true })
    foreignSellValue: number | null;

    @Column({ name: 'foreign_room_left_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
    foreignRoomLeftPercent: number | null;

    @Column({ name: 'eps_basic', type: 'decimal', precision: 10, scale: 2, nullable: true })
    epsBasic: number | null;

    @Column({ name: 'eps_diluted', type: 'decimal', precision: 10, scale: 2, nullable: true })
    epsDiluted: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    pe: number | null;

    @Column({ name: 'book_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
    bookValue: number | null;

    @Column({ name: 'pb', type: 'decimal', precision: 10, scale: 2, nullable: true })
    pb: number | null;

    @Column({ name: 'created_at', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(() => Stock, stock => stock.crawlData)
    @JoinColumn({ name: 'stock_id' })
    stock: Stock;
}