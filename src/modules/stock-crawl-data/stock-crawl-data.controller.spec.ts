import { Test, TestingModule } from '@nestjs/testing';
import { StockCrawlDataController } from './stock-crawl-data.controller';
import { StockCrawlDataService } from './stock-crawl-data.service';

describe('StockCrawlDataController', () => {
  let controller: StockCrawlDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockCrawlDataController],
      providers: [StockCrawlDataService],
    }).compile();

    controller = module.get<StockCrawlDataController>(StockCrawlDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
