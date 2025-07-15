import { Test, TestingModule } from '@nestjs/testing';
import { StockCrawlDataService } from './stock-crawl-data.service';

describe('StockCrawlDataService', () => {
  let service: StockCrawlDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockCrawlDataService],
    }).compile();

    service = module.get<StockCrawlDataService>(StockCrawlDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
