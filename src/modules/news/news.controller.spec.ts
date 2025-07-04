import { Test, TestingModule } from '@nestjs/testing';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

describe('NewsController', () => {
  let controller: NewsController;
  let service: NewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [
        {
          provide: NewsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NewsController>(NewsController);
    service = module.get<NewsService>(NewsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
