import { Test, TestingModule } from '@nestjs/testing';
import { AiAnalysisController } from './ai-analysis.controller';
import { AiAnalysisService } from './ai-analysis.service';

describe('AiAnalysisController', () => {
  let controller: AiAnalysisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiAnalysisController],
      providers: [AiAnalysisService],
    }).compile();

    controller = module.get<AiAnalysisController>(AiAnalysisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
