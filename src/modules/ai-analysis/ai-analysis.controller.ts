import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiAnalysisService } from './ai-analysis.service';

@ApiTags('AI Analysis')
@Controller('ai-analysis')
export class AiAnalysisController {
  constructor(private readonly aiAnalysisService: AiAnalysisService) { }
}
