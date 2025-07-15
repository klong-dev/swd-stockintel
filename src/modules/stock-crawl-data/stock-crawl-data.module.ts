import { Module } from '@nestjs/common';
import { StockCrawlDataService } from './stock-crawl-data.service';
import { StockCrawlDataController } from './stock-crawl-data.controller';
import { StockCrawlData } from './entities/stock-crawl-data.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtConfigModule } from 'src/configs/jwt-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockCrawlData]),
    JwtConfigModule,
  ],
  controllers: [StockCrawlDataController],
  providers: [StockCrawlDataService],
})
export class StockCrawlDataModule { }
