import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('/chat')
  create(@Body() message: string) {
    return this.aiService.chat(message);
  }
}
